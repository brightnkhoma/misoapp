'use client'

import React, { useEffect, useState } from 'react'
import {FaFileExcel} from 'react-icons/fa'
import { getFiles } from '../lib/dataSources/filesRepository'
import { CommitResult, MisoFile } from '../lib/dataSources/FilesDataSource'

export default function page() {
  const [files, setFiles] = useState<Array<MisoFile>>()
  const [error, setError] = useState<CommitResult>()
  async function get() {
    await getFiles(data=>setFiles(data),error =>setError(error))        
  }
  useEffect(()=>{
    if(!files){
      get()
  }
  },[])
  return (
    <div className='flex-1 flex flex-col p-8'>
      <div className='w-full h-full flex flex-col gap-8 flex-wrap overflow-auto'>
        {
          files && files.map((value,index)=>(
            <div key={index}>
              <ExcelFileComponent data={value}/>
            </div>
          ))
        }
        

      </div>
      
    </div>
  )
}

interface ExcelProps{
  data : MisoFile
}
const ExcelFileComponent : React.FC<ExcelProps> = ({data})=>{
  return(
    <div className=' max-w-28 hover:z-50 cursor-pointer flex flex-col items-center justify-center max-h-[500px] '>
      <FaFileExcel size={80} color='#217346'/>
      <span className='max-w-28 max-h-[100px] truncate hover:overflow-visible hover:whitespace-normal '>{data.name}</span>

    </div>
  )
}