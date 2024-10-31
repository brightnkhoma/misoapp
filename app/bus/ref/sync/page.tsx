'use client'

import React, { useEffect, useState } from 'react'
import {FaFileExcel,FaUpload,FaTrash} from 'react-icons/fa'
import { CommitResult, MisoFile } from '@/app/lib/dataSources/FilesDataSource'
import { processDataRef } from '@/app/lib/dataSources/filesRepository'
import { getFilesRefs } from '@/app/lib/dataSources/filesRepository'
import { deleteRef } from '@/app/lib/dataSources/filesRepository'
import { clearDatabase } from '@/app/lib/dataSources/filesRepository'


const DeleteButton = ()=>{
  const [toDelete, setToDelete] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [code, setCode] = useState<string>("")
  const [result, setResult] = useState<CommitResult>()

  useEffect(()=>{
    if(result?.status == false){
      setToDelete(false)
    }
  },[result])
  return(
    <div className=' flex flex-row gap-4'>{
      toDelete &&
      <input onChange={e=>setCode(e.target.value)} placeholder='enter code to continue' className='border-2 rounded-lg border-red-700 text-red-600 p-2' type="text" />}
      {result?.status == true && <span>Table Dropped</span>}
      
      <button disabled={deleting} onClick={async()=>{
        if(!toDelete) return setToDelete(true)
          setDeleting(true)
        await clearDatabase(code,data=>{
          console.log(data);
          setResult(data)
          setDeleting(false)

          
        })
      }} className='border px-4  rounded-lg'>
        {deleting ? "deleting..." : "drop table"}
      </button>
    </div>
  )
}
export default function Page() {
  const [files, setFiles] = useState<Array<MisoFile>>()
  const [error, setError] = useState<CommitResult>()
  async function get() {
    await getFilesRefs(data=>setFiles(data),error =>setError(error))        
  }
  useEffect(()=>{
    if(!files){
      get()
  }
  })
  return (
    <div className='flex-1 flex flex-col p-8'>
            <div className="w-full flex flex-row justify-end p-8">
        <DeleteButton/>
      </div>
      <div className='w-full h-full flex flex-row gap-8 flex-wrap overflow-auto'>
        {
          files && files.map((value,index)=>(
            <div key={index}>
              <ExcelFileComponent data={value}/>
            </div>
          ))
        }
      <span className='text-center text-red-600'>{error && error.message}</span>
        

      </div>
      
      
    </div>
  )
}

interface ExcelProps{
  data : MisoFile
}
const ExcelFileComponent : React.FC<ExcelProps> = ({data})=>{
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<CommitResult>()
  const [deleting, setDeleting] = useState<boolean>(false)
  const [deleted, setDeleted] = useState<boolean>(false)
  const [path, setPath] = useState("")

  return(
    <div className={`${deleted && "hidden"} max-w-28 hover:z-50 cursor-pointer flex flex-col items-center justify-center max-h-[500px] m-4 `}>
      <div className='w-full flex flex-row items-center justify-center gap-4'>

      <button disabled={loading} className={`${loading ? "animate-spin" : "animate-none" } bg-transparent ${error && error?.status == false ? "bg-red-500" :  "bg-green-500"} mb-2`} onClick={async()=>{
        setLoading(true)
        setPath("")
        await processDataRef(data.name,data.path,data=>{
        setPath(data)
        setLoading(false)
        setError({} as CommitResult)
      },failure=> {
        console.log(failure);
        
        setError(failure)
        setLoading(false)
        })}
        
        }>
      <FaUpload color={path ? "green" : "blue"}/>
      </button>

      <button onClick={async()=>{
        setDeleting(true)
        await deleteRef(data.name,name=>{
          console.log(name);
          setDeleted(true)
          setDeleting(false)
          
        },data =>{
          setDeleting(false)
          console.log(data);
          
        })
      }} disabled ={deleting || loading} className={`${deleting ? "animate-ping" : "animate-none"} mb-2 `}>
        <FaTrash/>
      </button>
      </div>
      <FaFileExcel size={80} color='#217346'/>
      <span className='max-w-28 max-h-[100px] truncate hover:overflow-visible hover:whitespace-normal '>{data.name}</span>

    </div>
  )
}