'use client'

import { Icon } from 'next/dist/lib/metadata/types/metadata-types'
import React from 'react'
import { IconType } from 'react-icons'
import {FaPhone, FaAd,FaDownload} from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface RouterProps{
    name : string,
    icon : IconType,
    onPress : ()=>void
}

interface HeaderProps{
    headerData : Array<RouterProps>

}


export const RouteComponent : React.FC<RouterProps> = ({icon : Icon,name,onPress})=>{
    return(
        <div onClick={onPress} className='w-full flex flex-row items-center gap-2 mx-4 cursor-pointer'>
            <Icon color='green'/>
            <span className='text-slate-300 active:text-slate-400'>{name}</span>            
        </div>
    )
}
export const Header = ()=>{
    const router = useRouter()
    const headerData = [
        {name : "add number",onPress :()=> {router.push("/")},icon : FaAd},
        {name : "assign numbers",onPress :()=> {router.push("/bus")},icon : FaPhone},
        {name : "download files",onPress :()=> {router.push("/bus/dow")},icon : FaDownload},
    ]
    return(
        <div className="sm:w-[20%] lg:w-[20%] md:w-[20%] xl:w-[15%] min-h-screen h-full bg-black flex flex-col">
            <div className='flex flex-row items-center justify-center text-white text-4xl font-extrabold py-4 '>
                <span className=''>M</span>
                <span>I</span>
                <span>S</span>
                <span>o</span>
            </div>
            <hr/>
            <div className='flex flex-col gap-4 pt-4 '>

            {
                headerData.map((value, index)=>(
                    <div key={index}>
                        <RouteComponent icon={value.icon} name={value.name} onPress={()=>value.onPress()}/>
                    </div>
                ))
            }
            </div>
        </div>
    )
}