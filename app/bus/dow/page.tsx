'use client'
import React from 'react'
import { getCompletedFiles } from '@/app/lib/dataSources/filesRepository'
import { MisoCompletedFile,CommitResult } from '@/app/lib/dataSources/FilesDataSource'
import { useState, useEffect } from 'react'
import {FaFileExcel, FaDownload, FaTrash} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { deleteData } from '@/app/lib/dataSources/filesRepository'
export default function Page() {
    const [files, setFiles] = useState<Array<MisoCompletedFile>>()
    const [error, setError] = useState<CommitResult>()
    async function get() {
        await getCompletedFiles(data=>setFiles(data),failure => setError(failure))
        
    }
    useEffect(()=>{
        if(!files){
            get()
        }
        
    })
  return (
    <div className='flex-1 flex flex-col p-8'>
        <div className='w-full h-full flex flex-row flex-wrap overflow-auto gap-6 max-w-[70rem]'>

        {
            files && files.map((file,index)=>(
                <div key={index}>
                    <ExcelFileComponent data={file}/>
                </div>
            ))
        }
        <div className='w-full'>
            {
                error && <span className='text-center'>{error.message}</span>
            }

        </div>
        </div>
    </div>
  )
}

interface ExcelProps{
    data : MisoCompletedFile
  }
  const ExcelFileComponent : React.FC<ExcelProps> = ({data})=>{
    const [deleting, setDeleting] = useState<boolean>(false)
    const [deleted, setDeleted] = useState<boolean>(false)
    const router = useRouter()
    return(
      <div className={`${deleted && "hidden"} max-w-28 hover:z-50 cursor-pointer flex flex-col items-center justify-center max-h-[500px] m-4 `}>
        <FaFileExcel size={80} color='#217346'/>
        <span className='max-w-28 max-h-[100px] truncate hover:overflow-visible hover:whitespace-normal '>{data.name}</span>
        <div className='w-full flex flex-row justify-between items-center'>
            <div onClick={async()=>router.push(data.path)}>
                <FaDownload color='blue'/>
            </div>
            <button onClick={async()=>{
                setDeleting(true)
                await deleteData(data.name,name=>{
                    console.log(name);
                    setDeleting(false)
                    setDeleted(true)                    
                },data =>{
                    console.log(data);
                    setDeleting(false)
                    
                })
            }} className={`${deleting ? "animate-pulse" : "animate-none"}`}>
                <FaTrash color='red'/>
            </button>
        </div>
  
      </div>
    )
  }

//   async function download(path:string) {

//     await axios.get(path)    
//   }