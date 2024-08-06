'use client';
// import Image from "next/image";
import { useState, useRef } from "react";
import Papa from "papaparse";
import axios from "axios";

interface CSVData {
  [key: string]: string;
}

const backend_url = "https://localhost:3000"

export default function Home() {
  const [file, setFile] = useState<File>()
  const [cards, setCards] = useState<CSVData[]>([])
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handlesSearchInput = (event:any) =>{
    console.log("handlesSearchInput()")
    console.log(event.target.value)
    axios.get('http://localhost:3000/api/users?q='+event.target.value)
    .then(function (response) {
      // handle success
      console.log(response);
      setCards(response.data.data)
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
  }

  const handleUploadButton = (event:any) =>{
    // console.log("handleUploadButton()")
    hiddenFileInput.current?.click();
  }

  const handleFileInputChange = async (event:any) =>{
    console.log("handleFileInputChange()")
    if (event.target.files && event.target.files[0]) {
      const f = event.target.files[0];
      setFile(f)
      Papa.parse(f, {
        delimiter:',',
        header: true,
        skipEmptyLines: true,
        // transformHeader: formatHeaderString,
        complete: uploadComplete,
      });

      // connect server
      let formData = new FormData();
      formData.append("file", f);
      try{
        axios.post('http://localhost:3000/api/files', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
        }).then(function (response) {
          console.log(response.data);
        });
      } catch(err){
        console.log(err)
      }
      


    }
    event.target.value = '' // Resetting input value to allow several sequential inputs.
  }

  const formatHeaderString = (h: string): string => {
    return h
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const uploadComplete = (results:any) => {
    setCards(results.data)
    //results .error
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-0 bg-gray-800">
      <div className="max-w-5xl w-full min-h-screen p-0 m-0 bg-zinc-200">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono lg:flex bg-zinc-800 p-1 lg:p-0">
          <div className="m-2 lg:m-2">
            <input className="border-1 border-white bg-white h-10 rounded-lg text-black p-1 mr-0 outline-none w-full lg:w-[300px] lg:w-auto" placeholder="Search..." onChange={handlesSearchInput} />
          </div>
          <div className="m-2 lg:m-2">
            <input type="file"
              ref={hiddenFileInput}
              onChange={handleFileInputChange}
              accept=".csv"
              style={{ display: 'none' }}
            />
            <button className="border-2 border-blue-600 bg-blue-600 h-10 px-5 font-semibold rounded-lg w-full lg:w-auto" onClick={handleUploadButton}>
              Upload
            </button>
          </div>
          
        </div>

        {(cards.length == 0) && <div className="text-black p-3">Use the &pos;Upload&pos; button above to send a CSV file, then use the search bar above to search for content inside it.</div>}

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full max-w-5xl lg:grid-cols-4 lg:text-left bg-zinc-200 text-black p-1">
          
          {
            cards.map((card,i) =>
              <div className="min-h-20 rounded-lg bg-white m-2 p-2 shadow-md" key={i}>
                
                {Object.keys(card).map((el,j)=>(
                  <div key={j}>
                    <div className="font-extrabold">{formatHeaderString(el)}</div>
                    <div>{card[el]}</div>
                  </div>
                ))}
                
              </div>
            )
          }
        </div>
      </div>
      
    </main>
  );
}
