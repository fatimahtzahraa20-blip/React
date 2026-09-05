import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logVideoCreated } from "../../lib/activityLogger";
import { notifyVideoSubmitted } from "../../lib/notificationService";
import supabase from "../../lib/supabase";

type Category={id:string|number;name:string};
type SubCategory={id:string|number;name:string;category_id?:string|number|null};
type CloudinaryResponse={secure_url:string;public_id:string};

const cloudName=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset=import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function uploadToCloudinary(file:File,type:"video"|"image",onProgress:(value:number)=>void){
  if(!cloudName||!uploadPreset){
    throw new Error("Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env");
  }

  const formData=new FormData();
  formData.append("file",file);
  formData.append("upload_preset",uploadPreset);
  formData.append("folder","video-editor-portfolio");

  return new Promise<CloudinaryResponse>((resolve,reject)=>{
    const request=new XMLHttpRequest();

    request.open("POST",`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`);

    request.upload.onprogress=(event)=>{
      if(event.lengthComputable){
        onProgress(Math.round((event.loaded/event.total)*100));
      }
    };

    request.onload=()=>{
      try{
        const response=JSON.parse(request.responseText);

        if(request.status<200||request.status>=300){
          reject(new Error(response?.error?.message||"Cloudinary upload failed."));
          return;
        }

        resolve(response);
      }catch{
        reject(new Error("Invalid Cloudinary response."));
      }
    };

    request.onerror=()=>reject(new Error("Network error while uploading."));
    request.send(formData);
  });
}

export default function AddVideo(){
  const navigate=useNavigate();
  const {user,profile}=useAuth();

  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [videoFile,setVideoFile]=useState<File|null>(null);
  const [videoUrl,setVideoUrl]=useState("");
  const [thumbnailUrl,setThumbnailUrl]=useState("");
  const [method,setMethod]=useState<"cloudinary"|"url">("cloudinary");
  const [categoryId,setCategoryId]=useState("");
  const [subCategoryId,setSubCategoryId]=useState("");
  const [categories,setCategories]=useState<Category[]>([]);
  const [subCategories,setSubCategories]=useState<SubCategory[]>([]);
  const [submitting,setSubmitting]=useState(false);
  const [videoProgress,setVideoProgress]=useState(0);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const load=async()=>{
      const [categoriesResult,subCategoriesResult]=await Promise.all([
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("subcategories").select("id,name,category_id").order("name")
      ]);

      if(categoriesResult.error)setError(categoriesResult.error.message);
      else setCategories((categoriesResult.data??[]) as Category[]);

      if(subCategoriesResult.error)setError(subCategoriesResult.error.message);
      else setSubCategories((subCategoriesResult.data??[]) as SubCategory[]);
    };

    void load();
  },[]);

  const visibleSubCategories=subCategories.filter(item=>
    !categoryId||String(item.category_id)===categoryId
  );

  const chooseVideo=(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]??null;

    if(file&&!file.type.startsWith("video/")){
      setError("Please select a valid video file.");
      return;
    }

    if(file&&file.size>100*1024*1024){
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setError("");
    setVideoFile(file);
  };

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();

    if(!user){
      setError("You must be logged in.");
      return;
    }

    if(method==="cloudinary"&&!videoFile){
      setError("Select a video file.");
      return;
    }

    if(method==="url"&&!videoUrl.trim()){
      setError("Enter a video URL.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");
    setVideoProgress(0);

    try{
      let finalVideoUrl=videoUrl.trim();
      let finalThumbnailUrl=thumbnailUrl.trim();
      let cloudinaryVideoPublicId:string|null=null;

      if(method==="cloudinary"&&videoFile){
        const uploadedVideo=await uploadToCloudinary(videoFile,"video",setVideoProgress);
        finalVideoUrl=uploadedVideo.secure_url;
        cloudinaryVideoPublicId=uploadedVideo.public_id;
      }

      const approvalStatus=profile?.role==="admin"?"approved":"pending";

      const {data,error:insertError}=await supabase
        .from("videos")
        .insert({
          title:title.trim(),
          description:description.trim()||null,
          video_url:finalVideoUrl,
          thumbnail_url:finalThumbnailUrl||null,
          category_id:categoryId||null,
          sub_category_id:subCategoryId||null,
          user_id:user.id,
          approval_status:approvalStatus,
          video_source:method==="cloudinary"?"cloudinary":"direct_url",
          cloudinary_video_public_id:cloudinaryVideoPublicId,
          cloudinary_thumbnail_public_id:null
        })
        .select("id,title")
        .single();

      if(insertError)throw new Error(insertError.message);

      await logVideoCreated(data.id,data.title,user.id);

      if(profile?.role!=="admin"){
        await notifyVideoSubmitted(user.id,data.title,data.id);
      }

      setMessage(
        profile?.role==="admin"
          ?"Video uploaded and published."
          :"Video uploaded and sent for approval."
      );

      window.setTimeout(()=>{
        navigate(profile?.role==="admin"?"/admin/videos":"/dashboard/videos",{replace:true});
      },1200);
    }catch(uploadError){
      setError(uploadError instanceof Error?uploadError.message:"Upload failed.");
    }finally{
      setSubmitting(false);
    }
  };

  return(
    <main className="dashboard-page min-h-screen px-4 pb-16 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="dashboard-panel p-6 sm:p-8">
          <p className="dashboard-eyebrow">Video submission</p>
          <h1 className="mt-2 text-3xl font-bold">Add New Video</h1>
          <p className="dashboard-copy mt-2 text-sm">Upload one video file to Cloudinary or use an existing video URL. Add an optional thumbnail URL below.</p>

          <div className="dashboard-toggle mt-8 grid grid-cols-2 p-1">
            <button type="button" onClick={()=>setMethod("cloudinary")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${method==="cloudinary"?"dashboard-toggle-active":""}`}>Upload file</button>
            <button type="button" onClick={()=>setMethod("url")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${method==="url"?"dashboard-toggle-active":""}`}>Use URL</button>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Video title" className="w-full rounded-lg border px-4 py-3 dark:bg-zinc-950" required/>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={5} className="w-full rounded-lg border px-4 py-3 dark:bg-zinc-950"/>

            {method==="cloudinary"?(
              <div>
                <label className="dashboard-file-picker">
                  <span className="font-semibold">Choose video file</span>
                  <span className="text-sm">MP4, MOV, or WebM · max 100 MB</span>
                  <input type="file" accept="video/*" onChange={chooseVideo} className="sr-only" required/>
                </label>
                {videoFile&&<p className="mt-2 text-sm text-zinc-500">{videoFile.name}</p>}
                {submitting&&videoProgress>0&&<progress value={videoProgress} max={100} className="mt-3 w-full"/>}
              </div>
            ):(
              <input type="url" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="Video URL" className="w-full rounded-lg border px-4 py-3 dark:bg-zinc-950" required/>
            )}

            <input type="url" value={thumbnailUrl} onChange={e=>setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL (optional)" className="dashboard-input w-full px-4 py-3"/>

            <div className="grid gap-4 sm:grid-cols-2">
              <select value={categoryId} onChange={e=>{setCategoryId(e.target.value);setSubCategoryId("");}} className="rounded-lg border px-4 py-3 dark:bg-zinc-950">
                <option value="">Select category</option>
                {categories.map(category=><option key={category.id} value={String(category.id)}>{category.name}</option>)}
              </select>

              <select value={subCategoryId} onChange={e=>setSubCategoryId(e.target.value)} className="rounded-lg border px-4 py-3 dark:bg-zinc-950">
                <option value="">Select subcategory</option>
                {visibleSubCategories.map(item=><option key={item.id} value={String(item.id)}>{item.name}</option>)}
              </select>
            </div>

            {message&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
            {error&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
                {submitting?"Uploading...":"Submit Video"}
              </button>
              <button type="button" onClick={()=>navigate(-1)} className="rounded-lg border px-6 py-3 font-semibold">Cancel</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

