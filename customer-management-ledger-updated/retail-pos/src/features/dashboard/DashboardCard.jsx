import { ArrowUpRight } from "lucide-react";

export default function DashboardCard({

    title,

    value,

    icon: Icon,

    color

}){

    return(

        <div className="bg-white rounded-xl shadow-sm border p-5">

            <div className="flex justify-between">

                <div>

                    <p className="text-gray-500 text-sm">

                        {title}

                    </p>

                    <h2 className="text-3xl font-bold mt-3">

                        {value}

                    </h2>

                </div>

                <div
                    className={`

                    w-12

                    h-12

                    rounded-xl

                    flex

                    justify-center

                    items-center

                    ${color}

                    `}
                >

                    <Icon className="text-white"/>

                </div>

            </div>

            <div className="flex items-center gap-2 mt-5">

                <ArrowUpRight size={18}/>

                <span className="text-green-600">

                    Updated Today

                </span>

            </div>

        </div>

    );

}