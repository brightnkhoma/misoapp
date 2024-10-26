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
    <div className='flex-1 flex flex-col p-8'>
      <div className='w-full h-full flex flex-col gap-8 flex-wrap overflow-auto'>
        <span className='text-center text-3xl text-slate-700'>process with the seledted reference</span>
        <div className='w-full flex flex-row items-center gap-4 overflow-auto bg-slate-500 p-4'>
          {
            refs && refs.map((value,index)=>(
              <div key={index}>
                <RefComponent myref={selectedRef as MisoFile} checked = {selectedRef == value} data={value} onClick={data =>setSelectedRef(data)}/>
              </div>
            ))
          }

        </div>
        <div className='flex flex-row gap-4 overflow-auto'>

        {
          selectedRef && selectedRef.name && selectedRef.path && files && refs && files.map((value,index)=>(
            <div key={index}>
              
              <ExcelFileComponent name={value.name} xpath={value.path} data={value}/>
              
            </div>
          ))
        }
        </div>
      <span className='text-center text-red-600'>{error && error.message}</span>
        

      </div>
      
      
    </div>
  )
}

interface RefProps{
  data : MisoFile;
  checked : boolean;
  onClick : (data : MisoFile) =>void;
  myref : MisoFile
}

const RefComponent : React.FC<RefProps> = ({checked,data,onClick,myref})=>{
  return(
    <div className='flex flex-col gap-4'>
      { myref &&
      <div>
        <ExcelFileComponent name={myref.name} xpath={myref.path} data={data}/>
        <input onClick={()=>onClick(data)} type="radio" checked = {checked} />
      </div>
      }
    </div>
  )
}

interface ExcelProps{
  data : MisoFile,
  xpath : string,
  name : string 
}
const ExcelFileComponent : React.FC<ExcelProps> = ({data,name,xpath})=>{
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
        if(xpath && name){
        setLoading(true)
        await processData(data.name,data.path,{name : name,path : xpath,status : true},data=>{
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