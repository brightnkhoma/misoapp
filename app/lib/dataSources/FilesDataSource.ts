import axios from 'axios';
import {db} from '../data/firebase'
import { getDoc,getDocs,setDoc,doc, collection, deleteDoc } from 'firebase/firestore';
import { getStorage,ref,uploadBytesResumable,getDownloadURL,deleteObject } from 'firebase/storage';


// const log = (data :any)=>{
//     console.log(data);
    
// }
const url = "https://misoapi-psi.vercel.app/"
export interface CommitResult{
    status : boolean,
    message : string
}

export interface MisoFile{
    name : string,
    path : string,
    status : boolean
}
export interface Progress{
    progress : string,
    finished : boolean,
    failed : boolean,
    name : string
}

export interface FileRef{
    name : string,
    path : string
}
export interface MisoCompletedFile{
  name : string,
  path : string
}

interface MisoFiles{
    upload : (path : FileList, onProgressChange : (progress : Progress)=> void, isRef : boolean,onFinish : (data : CommitResult)=>void)=> Promise<CommitResult>;
    //uploadref : (path : string)=> Promise<CommitResult>;
    delete : (name : string, isDownload : boolean,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void)=> Promise<CommitResult>;
    //download : (path : string)=> Promise<CommitResult>; 
    process : (name : string, path : string, onSuccess : (path : string)=> void, onFailure : (error : CommitResult)=> void)=> void
    fetchData : (isRef : boolean,onSuccess : (data : Array<MisoFile>) => void, onFailure : (data : CommitResult)=> void)=>void;
    fetchCompleteData : (onSuccess : (data : Array<MisoCompletedFile>) => void, onFailure : (data : CommitResult)=> void)=>void;
    clearUsers : (code : string,onResult : (data : CommitResult) => void)=> void
}

export class MisoFileDataSource implements MisoFiles{
    async clearUsers(code: string, onResult: (data: CommitResult) => void){
      try {
        if(code != "sudodelete1234") return onResult({status : false,message : "wrong code"})
          const res = await axios.post(`${url}clear/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 1000000 
        });
        
        
        const data = {status : res.data.status, message : res.data.message}
        console.log(data);
        onResult(data)
        
        
      } catch (error) {

        console.log(error);
        onResult({status : false, message : "something went wrong"})
        
        
      }
    }
    async process(name: string, path: string, onSuccess: (path: string) => void, onFailure: (error: CommitResult) => void){
      try {

        const res = await axios.post(`${url}addnumber/`,{name : name, path : path},{
          headers: {
            'Content-Type': 'application/json',
        }
        })
        
        const data = {status : res.data.status, message : res.data.message}
        console.log(data);
        
        if(data.status){
          const dbDoc = doc(db,"miso/data/processed",name)
          const myData = {name : name, path : data.message}
          await setDoc(dbDoc,myData)
          onSuccess(path)
        }else{
          onFailure({status : false, message : "failed to process"}) 
        }
        
      } catch (error) {
        onFailure({status : false, message : "something went wrong"})        
        
      }
    }
    async processRef(name: string, path: string, onSuccess: (path: string) => void, onFailure: (error: CommitResult) => void){
      try {

        const res = await axios.post(`${url}feeddata/`,{name : name, path : path},{
          headers: {
            'Content-Type': 'application/json',
        }
        })
        
        const data = {status : res.data.status, message : res.data.message}
        console.log(data);
        
        if(data.status){
          onSuccess(path)
        }else{
          onFailure({status : false, message : "failed to process"}) 
        }
        
      } catch (error) {
        onFailure({status : false, message : "something went wrong \n" + error})        
        
      }
    }
    async fetchCompleteData (onSuccess: (data: Array<MisoCompletedFile>) => void, onFailure: (data: CommitResult) => void){
      try {
        const dbCollection = collection(db,"miso/data/processed")
        const data = await getDocs(dbCollection)
        const files = data.docs.map(value=>value.data()) as Array<MisoCompletedFile>
        onSuccess(files)        
      } catch (error) {
        console.log(error)
      onFailure({status : false, message : "something went wrong"})        
      }
    }
    async fetchData(isRef : boolean = false,onSuccess : (data : Array<MisoFile>) => void, onFailure : (data : CommitResult)=> void) {
      try {
        const path = isRef? "miso/ref/data" : "miso/data/data"
        const dbCollection = collection(db,path)
        const data = await getDocs(dbCollection)
        const files = data.docs.map(value=>value.data()) as Array<MisoFile>
        onSuccess(files)     
        
      } catch (error) {
        onFailure({message : "something went wrong",status : false})
        
      }
    }
    cutString(word : string) : string{
      const ext = word.split(".")[1].toLowerCase()
      const newWord = word.length > 40 ? word.substring(0,35) + "." + ext : word
      return newWord

    }
    async upload(
        path: FileList, 
        onProgressChange: (progress: Progress) => void, 
        isRef: boolean = false, 
        onFinish: (data: CommitResult) => void
      ): Promise<CommitResult> {
        
        const storage = getStorage();
        const root = "miso/data";
      
        try {
          await Promise.all(
            Array.from(path).map(async (data) => {
              try {
                const x = await this.checkFileExistence(data.name, isRef);
                if (x==false) {
                  const reference = ref(storage, `${root}/${this.cutString(data.name)}`);
                  const uploadTask = uploadBytesResumable(reference, data);
      
                  uploadTask.on('state_changed', 
                    (snapshot) => {
                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      onProgressChange({ failed: false, finished: false, name: data.name, progress: progress.toString() });
                      console.log('Upload is ' + progress + '% done');
                      switch (snapshot.state) {
                        case 'paused':
                          console.log('Upload is paused');
                          break;
                        case 'running':
                          console.log('Upload is running');
                          break;
                      }
                    }, 
                    (error) => {
                      console.log(error)
                      onProgressChange({ failed: true, finished: false, name: data.name, progress: "failed" });
                    }, 
                    () => {
                      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        const fileRef = { name: this.cutString(data.name), path: downloadURL } as FileRef;
                        await this.checkRegister(data.name, fileRef, isRef);
                        onProgressChange({ failed: false, finished: true, name: data.name, progress: "100" });
                        console.log('File available at', downloadURL);
                      });
                    }
                  );
                } else {
                  console.log("exists")
                  console.log(x)
                    const message = x == null ? "error" : "exists"
                    onProgressChange({ failed: true, finished: false, name: data.name, progress: message });
                }
              } catch (error) {
                console.log(error);
                onProgressChange({ failed: true, finished: false, name: data.name, progress: "error" });
              }
            })
          );
      
          onFinish({ status: true, message: "files uploaded" });
          return { status: true, message: "files uploaded" };
      
        } catch (error) {
          console.log(error);
          onFinish({ status: false, message: "something went wrong" });
          return { status: false, message: "something went wrong" };
        }
      }
      
    // async uploadref(path: string) : Promise<CommitResult>{
    //     return {} as CommitResult
    // }
    async delete (name: string, isDownload : boolean,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void) : Promise<CommitResult>{
      try {
        const storage = getStorage();
        const root = isDownload ? "miso/data/processed" : "miso/data";
        const docRef = isDownload ? "miso/data/processed" : "miso/data/data"
        const dbdoc = doc(db,docRef,name)
        const reference = ref(storage,`${root}/${name}`)
        await deleteObject(reference).catch(e=>{
          console.log(e);
          onFailure({status : false, message : "something went wrong"})                 

        })
        await deleteDoc(dbdoc)
        onSuccess(name)
        
      } catch (error) {
        onFailure({status : false, message : "something went wrong"})       

        
      }
        return {} as CommitResult
    }
    async deleteRef (name: string,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void) : Promise<CommitResult>{
      try {
        const storage = getStorage();
        const root = "miso/data";
        const docRef = "miso/ref/data" 
        const dbdoc = doc(db,docRef,name)
        const reference = ref(storage,`${root}/${name}`)
        await deleteObject(reference).catch(e=>{
          console.log(e);
          onFailure({status : false, message : "something went wrong"})                 

        })
        await deleteDoc(dbdoc)
        onSuccess(name)
        
      } catch (error) {
        onFailure({status : false, message : "something went wrong"})       

        
      }
        return {} as CommitResult
    }
    // async download (path: string) : Promise<CommitResult>{
    //     return {} as CommitResult
    // }

    async checkFileExistence(name : string,isRef : boolean = false) : Promise<boolean | null>{
        try {
            const path = isRef? "miso/ref/data" : "miso/data/data"
            const dbDoc = doc(db,path,name)
            const file = await getDoc(dbDoc)
            return file.exists()            
        } catch (error) {
          console.log(error)
            return null            
        }
    }

    async checkRegister(name : string,file : FileRef,isRef : boolean = false) : Promise<CommitResult>{
        try {
            const path = isRef? "miso/ref/data" : "miso/data/data"
            const dbDoc = doc(db,path,this.cutString(name))
            await setDoc(dbDoc,file)
            return {status : true, message : "file registered"}            
        } catch (error) {
          console.log(error)
            return {status : false, message : "something went wrong"}         
                }
    }

}