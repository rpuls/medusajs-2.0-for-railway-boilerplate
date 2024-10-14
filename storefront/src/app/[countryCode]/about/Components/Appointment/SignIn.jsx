import React from "react";
const SignIn =  () => {
  const SERVER_IP = "https://backend-production-b11c.up.railway.app"; //de live
  const navigate=(url)=>{
      window.location.href= url;
  }

  const loginOAuth2Gabriela= async ()=>{
    try {
    const response =await fetch(SERVER_IP + "/api/google/Gabriela", {
      method:"GET",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data=await response.json();
    navigate(data.url);
    console.log(data.url);
  }
    catch (error) {
      console.error('An error occurred:', error);
    }
  
  }


  const loginOAuth2Stefania= async ()=>{
    try {
    const response =await fetch(SERVER_IP + "/api/google/Stefania", {
      method:"GET",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data=await response.json();
    navigate(data.url);
    console.log(data.url);
  }
    catch (error) {
      console.error('An error occurred:', error);
    }
  
  }
  const loginOAuth2Diana= async ()=>{
    try {
    const response =await fetch(SERVER_IP + "/api/google/Diana", {
      method:"GET",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data=await response.json();
    navigate(data.url);
    console.log(data.url);
  }
    catch (error) {
      console.error('An error occurred:', error);
    }
  
  }
  const loginOAuth2Catalina= async ()=>{
    try {
    const response =await fetch(SERVER_IP + "/api/google/Catalina", {
      method:"GET",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data=await response.json();
    navigate(data.url);
    console.log(data.url);
  }
    catch (error) {
      console.error('An error occurred:', error);
    }
  
  }

  const loginOAuth2Lorena= async ()=>{
    try {
    const response =await fetch(SERVER_IP + "/api/google/Lorena", {
      method:"GET",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data=await response.json();
    navigate(data.url);
    console.log(data.url);
  }
    catch (error) {
      console.error('An error occurred:', error);
    }
  
  }
  async function fetchMyAPI() {
    console.log("ceva")
    try {
      const response = await fetch(SERVER_IP + "/api/allInOne", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("data din allInOne",data);
    } catch (error) {
      console.error("An error occurred:", error);
    }

   
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center h-full py-[10rem] gap-12">
       <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>loginOAuth2Gabriela()}>
            SIGN IN GABRIELA
        </button>
        <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>loginOAuth2Stefania()}>
            SIGN IN STEFANIA
        </button>
        <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>loginOAuth2Diana()}>
            SIGN IN DIANA
        </button>
        <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>loginOAuth2Catalina()}>
            SIGN IN CATALINA
        </button>
        <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>loginOAuth2Lorena()}>
            SIGN IN LORENA
        </button>
        <button className="px-8 py-3 bg-green-500 text-white font-bold rounded-[8px] transition transition-[.3s[ ease-in-out hover:bg-green-600" type="button" onClick={()=>fetchMyAPI()}>
            SYNC APPOINTMENTS
        </button>
    </div>
  );
};

export default SignIn;
