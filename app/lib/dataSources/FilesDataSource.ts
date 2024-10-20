import app,{db} from '../data/firebase'
import { getDoc,getDocs,WriteBatch,setDoc,doc, collection } from 'firebase/firestore';
import { getStorage,ref,uploadBytes,uploadBytesResumable,getDownloadURL } from 'firebase/storage';
import path from 'path';


const log = (data :any)=>{
    console.log(data);
    
}
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
    uploadref : (path : string)=> Promise<CommitResult>;
    delete : (path : string)=> Promise<CommitResult>;
    download : (path : string)=> Promise<CommitResult>; 
    fetchData : (isRef : boolean,onSuccess : (data : Array<MisoFile>) => void, onFailure : (data : CommitResult)=> void)=>void;
    fetchCompleteData : (onSuccess : (data : Array<MisoCompletedFile>) => void, onFailure : (data : CommitResult)=> void)=>void;
}

export class MisoFileDataSource implements MisoFiles{
    async fetchCompleteData (onSuccess: (data: Array<MisoCompletedFile>) => void, onFailure: (data: CommitResult) => void){
      try {
        const dbCollection = collection(db,"miso/data/processed")
        const data = await getDocs(dbCollection)
        const files = data.docs.map(value=>value.data()) as Array<MisoCompletedFile>
        onSuccess(files)        
      } catch (error) {
      log(error)
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
                  const reference = ref(storage, `${root}/${data.name}`);
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
                        log(error)
                      onProgressChange({ failed: true, finished: false, name: data.name, progress: "failed" });
                    }, 
                    () => {
                      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        const fileRef = { name: data.name, path: downloadURL } as FileRef;
                        await this.checkRegister(data.name, fileRef, isRef);
                        onProgressChange({ failed: false, finished: true, name: data.name, progress: "100" });
                        console.log('File available at', downloadURL);
                      });
                    }
                  );
                } else {
                    log("exists")
                    log(x)
                    const message = x == null ? "error" : "exists"
                    onProgressChange({ failed: true, finished: false, name: data.name, progress: message });
                }
              } catch (error) {
                log(error);
                onProgressChange({ failed: true, finished: false, name: data.name, progress: "error" });
              }
            })
          );
      
          onFinish({ status: true, message: "files uploaded" });
          return { status: true, message: "files uploaded" };
      
        } catch (error) {
          log(error);
          onFinish({ status: false, message: "something went wrong" });
          return { status: false, message: "something went wrong" };
        }
      }
      
    async uploadref(path: string) : Promise<CommitResult>{
        return {} as CommitResult
    }
    async delete (path: string) : Promise<CommitResult>{
        return {} as CommitResult
    }
    async download (path: string) : Promise<CommitResult>{
        return {} as CommitResult
    }

    async checkFileExistence(name : string,isRef : boolean = false) : Promise<boolean | null>{
        try {
            const path = isRef? "miso/ref/data" : "miso/data/data"
            log(11)
            const dbDoc = doc(db,path,name)
            log(12)
            const file = await getDoc(dbDoc)
            log(13)
            return file.exists()            
        } catch (error) {
            log(14)
            log(error)
            return null            
        }
    }

    async checkRegister(name : string,file : FileRef,isRef : boolean = false) : Promise<CommitResult>{
        try {
            const path = isRef? "miso/ref/data" : "miso/data/data"
            const dbDoc = doc(db,path,name)
            await setDoc(dbDoc,file)
            return {status : true, message : "file registered"}            
        } catch (error) {
            log(error)
            return {status : false, message : "something went wrong"}         
                }
    }

}