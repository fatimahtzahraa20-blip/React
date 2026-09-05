import { useState, useRef, useEffect, useCallback } from "react";

export default function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 40, y: 40, w: 220, h: 220 });
  const [dragMode, setDragMode] = useState(null); // 'move' | 'resize'
  const [croppedUrl, setCroppedUrl] = useState(null);
  const imgRef = useRef(null);
  const dragStart = useRef(null);
  const displayW = 480;

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      setImgSize({ w: im.width, h: im.height });
      setImgSrc(url);
      setCrop({ x: 40, y: 40, w: 150, h: 150 });
      setCroppedUrl(null);
    };
    im.src = url;
  };

  const displayH = imgSize.w ? (displayW * imgSize.h) / imgSize.w : 0;
  const dispScale = imgSize.w ? displayW / imgSize.w : 1;

  const startDrag = (mode) => (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, crop: { ...crop } };
    setDragMode(mode);
  };

  useEffect(() => {
    if (!dragMode) return;
    const move = (e) => {
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - dragStart.current.x;
      const dy = point.clientY - dragStart.current.y;
      const start = dragStart.current.crop;
      setCrop((prev) => {
        let next = { ...prev };
        if (dragMode === "move") {
          next.x = Math.max(0, Math.min(displayW - start.w, start.x + dx));
          next.y = Math.max(0, Math.min(displayH - start.h, start.y + dy));
        } else if (dragMode === "resize") {
          next.w = Math.max(30, Math.min(displayW - start.x, start.w + dx));
          next.h = Math.max(30, Math.min(displayH - start.y, start.h + dy));
        }
        return next;
      });
    };
    const up = () => setDragMode(null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragMode, displayW, displayH]);

  const setCropDimension = (dimension, rawValue) => {
    if (!imgSrc) return;
    const pixels = Math.max(1, Number(rawValue) || 1);
    const displayPixels = pixels * dispScale;
    setCrop((current) => {
      if (dimension === "w") {
        return { ...current, w: Math.min(displayW - current.x, displayPixels) };
      }
      return { ...current, h: Math.min(displayH - current.y, displayPixels) };
    });
    setCroppedUrl(null);
  };
  const doCrop = useCallback(() => {
    if (!imgSrc) return;
    const im = imgRef.current;
    const sx = crop.x / dispScale;
    const sy = crop.y / dispScale;
    const sw = crop.w / dispScale;
    const sh = crop.h / dispScale;
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
    setCroppedUrl(canvas.toDataURL("image/png"));
  }, [imgSrc, crop, dispScale]);

  const download = () => {
    if (!croppedUrl) return;
    const a = document.createElement("a");
    a.href = croppedUrl;
    a.download = "cropped-image.png";
    a.click();
  };

  return (
    <div className="wrap">
      <h1>Crop your image</h1>
      <p className="sub">Upload an image, drag to move, use the handle to resize the crop area.</p>
      <div className="layout">
        <div className="stage">
          {!imgSrc && <label className="dropzone"><span className="uploadIcon">+</span><strong>Choose an image</strong><span>Click to browse your files</span><small>PNG, JPG or WEBP</small><input type="file" accept="image/*" onChange={onFile} /></label>}
          {imgSrc && (
            <div className="canvasWrap" style={{ width: displayW, height: displayH }}>
              <img ref={imgRef} src={imgSrc} style={{ width: displayW, height: displayH, display: "block" }} draggable={false} alt="Source" />
              <div
                className="cropBox"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                onMouseDown={startDrag("move")}
                onTouchStart={startDrag("move")}
              >
                <div
                  className="handle"
                  style={{ right: -6, bottom: -6, cursor: "nwse-resize" }}
                  onMouseDown={(e) => { e.stopPropagation(); startDrag("resize")(e); }}
                  onTouchStart={(e) => { e.stopPropagation(); startDrag("resize")(e); }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="side"><h2>Crop settings</h2>
          {imgSrc && <input type="file" accept="image/*" onChange={onFile} />}
          <div className="dimensionField">
            <label htmlFor="crop-width">Crop width</label>
            <span><input id="crop-width" type="number" min="1" max={imgSize.w || 1} value={Math.round(crop.w / dispScale) || 0} disabled={!imgSrc} onChange={(e) => setCropDimension("w", e.target.value)} /> px</span>
          </div>
          <div className="dimensionField">
            <label htmlFor="crop-height">Crop height</label>
            <span><input id="crop-height" type="number" min="1" max={imgSize.h || 1} value={Math.round(crop.h / dispScale) || 0} disabled={!imgSrc} onChange={(e) => setCropDimension("h", e.target.value)} /> px</span>
          </div>
          <button onClick={doCrop} disabled={!imgSrc}>Crop image</button>
          {croppedUrl && (
            <>
              <img className="preview" src={croppedUrl} alt="Cropped result" />
              <div className="row">
                <button className="ghost" onClick={() => setCroppedUrl(null)}>Reset</button>
                <button onClick={download}>Download</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
