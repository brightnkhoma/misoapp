'use client'

import React, { useEffect, useState } from 'react'
import {FaFileExcel,FaUpload,FaTrash} from 'react-icons/fa'
import { getFiles } from '../lib/dataSources/filesRepository'
import { CommitResult, MisoFile } from '../lib/dataSources/FilesDataSource'
import { processData } from '../lib/dataSources/filesRepository'
import { deleteDataRefs } from '../lib/dataSources/filesRepository'
import { getFilesRefs } from '../lib/dataSources/filesRepository'

export default function Page() {
  const [files, setFiles] = useState<Array<MisoFile>>()
  const [refs,setRefs] = useState<Array<MisoFile>>()
  const [error, setError] = useState<CommitResult>()
  const [selectedRef, setSelectedRef] = useState<MisoFile>()

  async function get() {
    await getFiles(data=>setFiles(data),error =>setError(error))        
  }
  async function getRefs() {
    await getFilesRefs(data=>setRefs(data),error =>setError(error))        
  }
  useEffect(()=>{
    if(!files){
      get()
  }
  })
  useEffect(()=>{
    if(!refs){
      getRefs()
  }
  })
  useEffect(()=>{
    if(refs && !selectedRef){
      setSelectedRef(refs[0])
  }
  },[refs])
  return (
    <div className='w-full flex flex-col p-2 overflow-auto '>
      <div className='w-full h-full flex flex-col gap-8  overflow-auto'>

        <div  className='w-full cursor-pointer gap-4 items-center flex flex-row p-2 justify-end'>
          <span className='text-blue-700 text-2xl font-extrabold'>From db</span>

        <input checked={true} type="radio" />
        </div>

        <div className='flex flex-row gap-4 w-screen flex-wrap max-w-[70rem]'>

        {
            files  && files.map((value,index)=>(
            <div key={index}>
              
              <ExcelFileComponent fromSnippets={true} name={selectedRef? selectedRef.name : ""} xpath={ selectedRef ? selectedRef?.path : ""} data={value}/>
              
            </div>
          ))
        }
        </div>
      <span className='text-center text-red-600'>{error && error.message}</span>
        

      </div>
      
      
    </div>
  )
}

// interface RefProps{
//   data : MisoFile;
//   checked : boolean;
//   onClick : (data : MisoFile) =>void;
//   myref : MisoFile | undefined
// }

// const RefComponent : React.FC<RefProps> = ({checked,data,onClick,myref})=>{
//   return(
//     <div className='flex flex-col gap-4'>
//       { myref &&
//       <div>
//         <ExcelFileComponent fromSnippets name={myref.name} xpath={myref.path} data={data}/>
//         <input onClick={()=>onClick(data)} type="radio" checked = {checked} />
//       </div>
//       }
//     </div>
//   )
// }

interface ExcelProps{
  data : MisoFile;
  xpath : string;
  name : string;
  fromSnippets : boolean
}
const ExcelFileComponent : React.FC<ExcelProps> = ({data,name,xpath,fromSnippets})=>{
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<CommitResult>()
  const [deleting, setDeleting] = useState<boolean>(false)
  const [deleted, setDeleted] = useState<boolean>(false)
  const [path, setPath] = useState("")

  return(
    <div className={`${deleted && "hidden"} max-w-28 hover:z-50 cursor-pointer flex flex-col items-center justify-center max-h-[500px] m-4 `}>
      <div className='w-full flex flex-row items-center justify-center gap-4'>

      <button disabled={loading} className={`${loading ? "animate-spin" : "animate-none" } bg-transparent ${error && error?.status == false ? "bg-red-500" :  "bg-green-500"} mb-2`} onClick={async()=>{
        setPath("")
        if((xpath && name) || fromSnippets){
        setLoading(true)
        console.log(xpath);
        
        await processData(data.name,data.path,{name : name,path : xpath,status : true},fromSnippets,data=>{
        setPath(data)
        setLoading(false)
        setError({} as CommitResult)
      },failure=> {
        console.log(failure);
        
        setError(failure)
        setLoading(false)
        })}
      }
        
        }>
      <FaUpload color={path ? "green" : "blue"}/>
      </button>

      <button onClick={async()=>{
        setDeleting(true)
        await deleteDataRefs(data.name,name=>{
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