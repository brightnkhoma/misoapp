'use client'
import React, { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import {FaUpload,FaHandPointer,FaFileExcel} from 'react-icons/fa'
import { useDropzone } from "react-dropzone";
import { uploadExcelFileRef } from "@/app//lib/dataSources/filesRepository";
import { Progress } from "@/app/lib/dataSources/FilesDataSource";
interface UploadButtonProps{
  action : string,
  icon : IconType,
  onPress : ()=>void
}



const UploadButton : React.FC<UploadButtonProps> = ({action,icon : Icon,onPress})=>{
  return(
    <button onClick={()=>onPress()} className="flex flex-col justify-center items-center px-6 py-1 bg-slate-600  rounded-md cursor-pointer active:opacity-80">
      <Icon color="white"/>
      <span className="text-slate-300 font-bold">{action}</span>
    </button>
  )
}


const FileUpload = ()=>{
  const ref = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<FileList | File[]>()
  const [uploading,setUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<Array<Progress>>()
  useEffect(()=>{
    if(progress){
      let count = progress?.length
      progress.forEach(data=>{
        if(data.failed || data.finished) count = count -1
      })
      if(count == 0) setUploading(false)
      
    }
  },[uploading,progress])

  const onSelect = ()=>{
    if(ref.current)
    ref.current.click()
  }


  useEffect(()=>{
    if(files){
      const data = Array.from(files).map(value=>({name : value.name, failed : false, finished : false,progress : "0 %"} as Progress))
      setProgress(data)
    }
  },[files])
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
    const files = event.target.files as FileList
    
    setFiles(files)

  }
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  };
  async function onUpload() {
    setUploading(true);
  
    await uploadExcelFileRef(
      files as FileList,
      data => {
        if (progress) {
          let copy = [...progress]
          const exists = copy.find(value=>value.name == data.name)
          if(exists){
            exists.progress = data.progress
            exists.failed = data.failed
            exists.finished = data.finished            
          }else{
            copy = [...copy,data]
          } 
          setProgress(copy)         
        } else{
          setProgress([data])
        }
      },
      data => {
        console.log(JSON.stringify(data));        
         setUploading(false);
      }
    );

  }
  
  // function check() : boolean{
  //   return files?.length != null && files.length > 0
  // }
  // function getProgress(name : string) : Progress{
  //   if(check()){
  //     const fileName = progress?.find(value=> value.name == name)
  //     if(fileName){ return fileName} else return {} as Progress
  //   }else
  //   return {} as Progress
  // }

  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return(
    <div className="w-full ">
      <input accept=".csv, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>onFileChange(e)} ref={ref} type="file" multiple className="hidden"/>
      <div  className="w-full flex flex-row items-center  gap-4 mt-4">
        <UploadButton  onPress={onSelect} icon={FaHandPointer} action="Select"/>
        <UploadButton onPress={onUpload} icon={FaUpload} action={`${uploading ? "uploading" : "upload"}`}/>
      </div>

      <div className="flex flex-row flex-wrap h-full justify-between w-full">
      <div
      {...getRootProps({
        className: 'border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer',
      })}
      className="bg-gray-100 min-w-max w-[40%] mt-10 h-[300px] flex justify-center items-center rounded-lg cursor-pointer hover:opacity-80 ">
      <input accept=".csv, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" {...getInputProps()} />
        <span className="text-slate-700 font-extrabold text-center m-10">Drag and Drop xlsx Files</span>

      </div>
      <div className="flex flex-col h-[300px]  overflow-auto  mt-10">
        {
         progress && Array.from(progress).map((value,index)=>(          
          <div key={index} className="flex flex-row items-center gap-4 ">
            <span  className="text-slate-600 font-semibold my-1 truncate min-w-[300px] max-w-[300px]">{index + 1} {" . "} {value.name}</span>
            <FaFileExcel/>
            <ProgressIndicator failed = {value.failed} finished={value.finished} name={value.name} progress={value.progress} />

          </div>
         ))
        }
      </div>
      </div>

    </div>
  )
}

const ProgressIndicator : React.FC<Progress> = ({failed,finished,progress})=>{
  return(
    <div className="w-max">
      <span className={`${finished? "text-green-700" : failed ? "text-red-700" : "text-blue-700"} font-semibold`}>{progress}</span>
    </div>
  )
}

export default function Home() {
  return (
    <div className="h-screen w-screen  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col h-full w-full">
       <div className="h-full w-full flex flex-col">
      <FileUpload/>
       </div>
      </main>     
    </div>
  );
}
