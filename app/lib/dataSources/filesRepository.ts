import { MisoFileDataSource,CommitResult,MisoFile,Progress,MisoCompletedFile } from "./FilesDataSource";


export async function uploadExcelFileData(path : FileList, onProgressChange : (progress : Progress)=> void,onFinish : (data : CommitResult)=>void) : Promise<CommitResult>{
    const dataSource = new MisoFileDataSource()
    const result = await dataSource.upload(path,onProgressChange,false,onFinish)
    return result
}
export async function uploadExcelFileRef(path : FileList, onProgressChange : (progress : Progress)=> void,onFinish : (data : CommitResult)=>void) : Promise<CommitResult>{
    const dataSource = new MisoFileDataSource()
    const result = await dataSource.upload(path,onProgressChange,true,onFinish)
    return result
}
export async function getFiles(onSuccess : (data : Array<MisoFile>) => void, onFailure : (data : CommitResult)=> void){
    const dataSource = new MisoFileDataSource()
    await dataSource.fetchData(false,onSuccess,onFailure)
}
export async function getFilesRefs(onSuccess : (data : Array<MisoFile>) => void, onFailure : (data : CommitResult)=> void){
    const dataSource = new MisoFileDataSource()
    await dataSource.fetchData(true,onSuccess,onFailure)
}
export async function getCompletedFiles(onSuccess : (data : Array<MisoCompletedFile>) => void, onFailure : (data : CommitResult)=> void){
    const dataSource = new MisoFileDataSource()
    await dataSource.fetchCompleteData(onSuccess,onFailure)
}
export async function processData(name : string, path : string,onSuccess : (data : string) => void, onFailure : (data : CommitResult)=> void){
    const dataSource = new MisoFileDataSource()
    await dataSource.process(name,path,onSuccess,onFailure)
}
export async function processDataRef(name : string, path : string,onSuccess : (data : string) => void, onFailure : (data : CommitResult)=> void){
    const dataSource = new MisoFileDataSource()
    await dataSource.processRef(name,path,onSuccess,onFailure)
}
export async function deleteData(name: string,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void){
    const dataSource = new MisoFileDataSource()
    await dataSource.delete(name,true,onSuccess,onFailure)
}
export async function deleteDataRefs(name: string,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void){
    const dataSource = new MisoFileDataSource()
    await dataSource.delete(name,false,onSuccess,onFailure)
}
export async function deleteRef (name: string,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void) {
    const dataSource = new MisoFileDataSource()
    await dataSource.deleteRef(name,onSuccess,onFailure)
}
