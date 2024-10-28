import axios from 'axios';
import {db} from '../data/firebase'
import { getDoc,getDocs,setDoc,doc, collection, deleteDoc } from 'firebase/firestore';
import { getStorage,ref,uploadBytesResumable,getDownloadURL,deleteObject } from 'firebase/storage';
import firebase from 'firebase/compat/app';


// const log = (data :any)=>{
//     console.log(data);
    
// }
// const url = "https://misoapi-2c65i0l1o-bright-nkhomas-projects.vercel.app/"
// const url = "https://misoapi-psi.vercel.app/"
// const url = "https://misoapi-1hk5ush0r-bright-nkhomas-projects.vercel.app/"
// const url = "http://192.168.43.56:8000/"
const url = "https://misoapi-q48a.onrender.com/"
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
    process : (name : string, path : string,ref : MisoFile,fromSnippets : boolean, onSuccess : (path : string)=> void, onFailure : (error : CommitResult)=> void)=> void
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
    async process(name: string, path: string,ref : MisoFile,fromSnippets : boolean = false, onSuccess: (path: string) => void, onFailure: (error: CommitResult) => void){
      try {
        

        // alert(JSON.stringify(ref))
        
        const res = await axios.post(`${url}addnumber/`,{name : name, path :path, ref : ref.path, refname : ref.name,fromSnippets : fromSnippets},{
          headers: {
            'Content-Type': 'application/json',
        }
        })
        // alert(JSON.stringify(ref))

        
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
        console.log(error);
        
        onFailure({status : false, message : "something went wrong"})        
        
      }
    }
    async processRef(name: string, path: string, onSuccess: (path: string) => void, onFailure: (error: CommitResult) => void){
      try {

        const res = await axios.post(`${url}populate/`,{name : name, path : path},{
          headers: {
            'Content-Type': 'application/json',
        },
        timeout : 60000000
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
    // cutString(word : string,index : string) : string{
    //   const ext = word.split(".")[1].toLowerCase()
    //   const newWord = word.length > 40 ? index + word.substring(0,35) + "." + ext : word
    //   return newWord

    // }
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
                      console.log(error)
                      onProgressChange({ failed: true, finished: false, name: data.name, progress: "failed" });
                    }, 
                    () => {
                      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        const name = data.name
                        const fileRef = { name:name, path: downloadURL } as FileRef;

                        await this.checkRegister(name, fileRef, isRef);

                        onProgressChange({ failed: false, finished: true, name: data.name, progress: "100" });
                        console.log('File available at', downloadURL);
                      });
                    }
                  );
                } else {
                  console.log("exists")
                  console.log(x)
                    const message = x == null ? "error" : "exists"
                    const name = data.name
                    onProgressChange({ failed: true, finished: false, name: name, progress: message });
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
        await deleteDoc(dbdoc).then(async()=>{

          await deleteObject(reference).catch(e=>{
            console.log(e);
            onFailure({status : false, message : "something went wrong"})                 
  
          })
        })

        onSuccess(name)
        
      } catch (error) {
        onFailure({status : false, message : "something went wrong"})       

        
      }
        return {} as CommitResult
    }
    async deleteRef (name: string,onSuccess : (name : string)=> void, onFailure : (data : CommitResult)=>void) : Promise<CommitResult>{
      // try {
      //   const storage = getStorage();
      //   const root = "miso/data";
      //   const docRef = "miso/ref/data" 
      //   const dbdoc = doc(db,docRef,name)
      //   const reference = ref(storage,`${root}/${name}`)
      //   await deleteObject(reference).catch(e=>{
      //     console.log(e);
      //     onFailure({status : false, message : "something went wrong"})                 

      //   })
      //   await deleteDoc(dbdoc)
      //   onSuccess(name)
        
      // } catch (error) {
      //   onFailure({status : false, message : "something went wrong"})       

        
      // }
      const docRef = "miso/ref/data/" + name
      await deleteFileAndReference(docRef).then(()=>{
        onSuccess(name)
      }).catch(e=>onFailure({status : false, message : `something went wrong \n${e}`}) )
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
            const dbDoc = doc(db,path,name)
            await setDoc(dbDoc,file)
            return {status : true, message : "file registered"}            
        } catch (error) {
          console.log(error)
            return {status : false, message : "something went wrong"}         
                }
    }

}

// ... (Firebase initialization)

async function deleteFileAndReference(documentId : string) {
  const firestore = firebase.firestore();
  const storage = new Storage();

  try {
    await firestore.runTransaction(async (transaction) => {
      const documentRef = firestore.doc(`${documentId}`);
      const docSnapshot = await transaction.get(documentRef);

      if ( docSnapshot.exists) {
        const storedFile = docSnapshot.data() as MisoFile; 
        const fileUrl = storedFile.path
        const bucket = storage.bucket();
        const file = bucket.file(fileUrl.split('/').pop());
        await file.delete();

        transaction.delete(documentRef);
      }
    });
  } catch (error) {
    console.error('Error deleting file and reference:', error);
    // Implement retry logic or other error handling strategies
  }
}