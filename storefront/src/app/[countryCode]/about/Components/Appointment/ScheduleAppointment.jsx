import React, { useEffect, useState, useRef } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { SlUserFemale } from "react-icons/sl";
import { GoTasklist } from "react-icons/go";
import { BsCalendar3, BsCalendarCheck } from "react-icons/bs";
import Profesionist from "./Profesionist";
import Service from "./Service";
import data from "./Services.json";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Cookies from "js-cookie";
import emailjs, { send } from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import Catalina from "./Images/Catalina.jpeg";
import Diana from "./Images/Diana.jpeg";
import Gabriela from "./Images/Gabriela.jpeg";
import Stefania from "./Images/Stefania.jpeg";

//TODO trebuie sa adaug numarul de telefon la req la sendmessagecomfirmation

const Appointment = () => {
  const SERVER_IP = "https://backend-production-b11c.up.railway.app"; //de live
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [action, setAction] = useState(-1);
  const [professional, setProfessional] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [service, setService] = useState([]);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+40");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedData, selectData] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("");
  const [timer, setTimer] = useState(60);
  const [checkTerms, setCheckTerms] = useState(false);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [serviceButton, setServiceButton] = useState(false);
  const [appearPayment, setPaymentAppear] = useState(false);

  const [user, setUser] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [allCustomers, setAllCustomers] = useState([1]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchName,setSearchName]=useState("");
  const [comfirmationMessage,setComfirmationMessage]=useState([]);
  const [selectedPhoneNumber,setSelectedPhoneNumber]=useState("");
  const [sendButton,setSendButton]=useState([]);
  const [artistIndex,setArtistIndex]=useState(-1);
  const form = useRef();
  const showAllCustomers = async () => {
    try {
        const res = await fetch(SERVER_IP + "/api/allCustomers", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        
        setLoadingCustomers(false);
        const data = await res.json();
        let eachFalse=[]
        data.forEach((customer, customerIndex) => {
          eachFalse[customerIndex]=false;
        })
        setSendButton(eachFalse)
        console.log("data: ", data[0]);
        setAllCustomers(data);  

        const closestEvent = new Array(data.length);

        data.forEach((customer, customerIndex) => {
            if (customer[1].length === 0) {
                closestEvent[customerIndex] = "nu exista programare";
                return;
            }

            // Initialize with the first event date
            let localClosestEvent = new Date(customer[1][0].substring(0, 10));
            let minDiff = Math.abs(new Date() - localClosestEvent);

            customer[1].forEach((event) => {
                const eventDate = new Date(event.substring(0, 10));
                const diff = Math.abs(new Date() - eventDate);
                console.log("new Date()> eventDate",new Date()> eventDate);
                if (diff < minDiff &&  eventDate > new Date()) {
                    minDiff = diff;
                    localClosestEvent = eventDate;
                }
            });

            closestEvent[customerIndex] = localClosestEvent.toISOString().substring(0, 10);
        });

        const messages = data.map((customer, customerIndex) => `Buna, ${customer[0]} ! Voiam sa-ti reamintesc ca te astept cu drag maine ${closestEvent[customerIndex]} la ora: ${customer[1][0].substring(customer[1][0].indexOf("ora:")+5, customer[1][0].indexOf("ora:")+10)} , la Lorena Lash Studio`);
        setComfirmationMessage(messages);
        console.log(messages);
    } catch (err) {
        console.log(err);
    }
};

  const sendManualComfirmation=async(nameCustomer,contactPhoneNumber,custIndex)=>{
    console.log(contactPhoneNumber);
    let updatedSendButton = [...sendButton];
    updatedSendButton[custIndex] = true;
    setSendButton(updatedSendButton)
    try {
      const res= await fetch(SERVER_IP + "/api/sendManualConfirmation", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: nameCustomer,phoneNumber: "+40753616640"}),
      })
    }catch (error) {
      // Handle fetch error
      console.error("Fetch error:", error);
    }
   
  }


  const handleForm = async (e) => {
    e.preventDefault();

    console.log("Client Name:", clientName);
    try {
      const response = await fetch(SERVER_IP + "/api/create-customer", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerName: clientName }),
      });
    } catch (error) {
      // Handle fetch error
      console.error("Fetch error:", error);
    }
    emailjs
      .sendForm(
        "service_jpyyu6x",
        "template_86rd8il",
        form.current,
        "H4P13RXVt3XQCUqR1"
      )
      .then(
        (result) => {
          scheduleEvent();
          sendConfirmationDetails();

          setStage(5);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };
  const isDigitOrBackspace = (input) => /^[0-9\b]$/.test(input);
  const [availableHours, setAvailableHours] = useState([]);

  const [paymentStatus, setPaymentStatus] = useState(false);
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Calculate the date 3 months from now
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  // Custom function to disable dates beyond 3 months from now
  const isDateDisabled = (date) => {
    const currentDate = new Date(); // Get the current date
    const twentyNovemberThisMonth = new Date(currentDate.getFullYear(), 10, 20); // November is month 10
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return (
      (professional === "Gabriela" && date < twentyNovemberThisMonth) ||
      (professional === "Diana" &&
        date.getMonth() === 10 &&
        date.getDay() === 1) || // Monday in November for Diana
      date > threeMonthsLater ||
      isWeekend(date)
    );
  };

  const durationsAddition = (totalDuration, toAddDuration, shouldSubtract) => {
    // Check if totalDuration is an empty string
    if (totalDuration === "") {
      return toAddDuration;
    }

    const totalParts = totalDuration.split(":");
    const addParts = toAddDuration.split(":");

    if (totalParts.length === 2 && addParts.length === 2) {
      const totalHours = parseInt(totalParts[0]);
      const totalMinutes = parseInt(totalParts[1]);
      const addHours = parseInt(addParts[0]);
      const addMinutes = parseInt(addParts[1]);

      let hours = shouldSubtract
        ? totalHours - addHours
        : totalHours + addHours;
      let minutes = shouldSubtract
        ? totalMinutes - addMinutes
        : totalMinutes + addMinutes;

      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }

      while (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }

      if (hours < 0) {
        hours = 0;
        minutes = 0;
      }

      if (hours === 0 && minutes === 0) {
        return "";
      }

      let resultString = `${hours}:${minutes.toString().padStart(2, "0")}`;

      if (hours < 10 && resultString.startsWith("0")) {
        resultString = resultString.slice(1); // Remove leading '0' if hours are less than 10
      }

      console.log("durations addition: " + resultString);

      return resultString;
    } else {
      console.log(totalDuration, toAddDuration, shouldSubtract);
      console.error("Invalid input format for durations.");
      return totalDuration; // or some default value
    }
  };

  const pricesAddition = (anteriorPrice, toAddPrice) => {
    const anterior = parseInt(anteriorPrice);
    const toAdd = parseInt(toAddPrice);

    if (!isNaN(anterior) && !isNaN(toAdd)) {
      return (anterior + toAdd).toString();
    } else {
      // Handle the case where either input is not a valid number
      return "Invalid input";
    }
  };
  const servicesToString = (...services) => {
    let allServices = "";
    for (const serviceElement of services) allServices += serviceElement + " ";
    return allServices;
  };

  useEffect(() => {
    if (professional !== "") {
      setStage(1);
      window.scrollTo({ top: 0, left: 0 });
    }
    console.log(stage);
  }, [professional]);

  function formatDateFromDateString(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }
  const checkAvailableHours = (startTime, finishTime) => {
    console.log("selectedData", selectedData, "newDate", selectedData.getDay());
    if (
      selectedData.getTime() >= new Date().getTime() &&
      selectedData.getDay() !== 0 &&
      selectedData.getDay() !== 6
    ) {
      console.log("appointmentsData:", appointmentsData);
      if (!startTime || !finishTime) {
        console.error("Invalid input data");
        return;
      }

      // Parse the start and finish times as 24-hour time strings
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [finishHour, finishMinute] = finishTime.split(":").map(Number);

      // Parse the service duration as "1:00"
      const [serviceHour, serviceMinute] = serviceDuration
        .split(":")
        .map(Number);

      const serviceDurationHour = parseInt(serviceDuration[0]);
      const serviceDurationMinute =
        parseInt(serviceDuration[2]) * 10 + parseInt(serviceDuration[3]);

      const appointmentHours = [];
      setAvailableHours([]);
      console.log(serviceDurationHour);
      // Initialize a current time variable in hours and minutes

      let currentHour = startHour;
      let currentMinute = startMinute;
      let efficient = 0;
      while (
        (currentHour === 18 && currentMinute === 0) ||
        currentHour === 17 ||
        currentHour +
          serviceDurationHour +
          Math.floor((currentMinute + serviceDurationMinute) / 60) <=
          finishHour ||
        (currentHour + serviceDurationHour === finishHour &&
          currentMinute + serviceDurationMinute <= finishMinute)
      ) {
        let isAvailable = true;
        for (let j = efficient; j < appointmentsData.length; j++) {
          const appointmentStartHour = parseInt(
            appointmentsData[j].start.dateTime.slice(11, 13)
          );
          const appointmentStartMinute = parseInt(
            appointmentsData[j].start.dateTime.slice(14, 16)
          );
          let appointmentEndHour = parseInt(
            appointmentsData[j].end.dateTime.slice(11, 13)
          );
          let appointmentEndMinute = parseInt(
            appointmentsData[j].end.dateTime.slice(14, 16)
          );

          console.log(
            "currentHour: ",
            currentHour,
            " currentMinute: ",
            currentMinute
          );

          if (
            (currentHour === appointmentStartHour &&
              currentMinute >= appointmentStartMinute) ||
            (currentHour === appointmentEndHour &&
              currentMinute < appointmentEndMinute) ||
            (currentHour +
              serviceDurationHour +
              Math.floor((currentMinute + serviceDurationMinute) / 60) >=
              appointmentStartHour &&
              currentHour +
                serviceDurationHour +
                Math.floor((currentMinute + serviceDurationMinute) / 60) <=
                appointmentEndHour)
          ) {
            isAvailable = false;
            currentHour = appointmentEndHour;
            currentMinute = appointmentEndMinute;
            if (appointmentEndHour - appointmentStartHour >= 2) {
              currentMinute += 30;
              currentHour += Math.floor(currentMinute / 60);
              currentMinute = currentMinute % 60;
            }
            efficient += 1;
            break;
          }
        }

        if (isAvailable) {
          const timeString = `${currentHour
            .toString()
            .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
          appointmentHours.push(timeString);
          currentMinute += serviceMinute;
          if (serviceDurationHour >= 2) currentMinute += 30;
          currentHour += Math.floor(currentMinute / 60);
          currentMinute %= 60;
          currentHour += serviceHour;
        }
      }

      // Do something with appointmentHours, like set it in the state
      setAvailableHours(appointmentHours);

      console.log(appointmentHours);
    } else setAvailableHours([]);
  };

  async function sendCode(e) {
    e.preventDefault();
    await fetch(SERVER_IP + "/api/send-code", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: phoneNumber }),
    }).then((response) => {
      console.log(response);
      if (response.ok === true) {
        setTimer(60);
      } else console.log("Oh no we have an error");
    });
  }

  async function sendConfirmationDetails() {
    console.log(phoneNumber);
    await fetch(SERVER_IP + "/api/send-details", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        service: servicesToString(service),
        serviceDate: selectedData,
        serviceTime: selectedHour,
      }),
    }).then((response) => {
      console.log(response);
      if (response.ok === true) {
        console.log("Details sent");
      } else console.log("Oh no we have an error");
    });
  }
  const setUserToken = (token) => {
    // Set the token in cookies with js-cookie
    Cookies.set("token", token, { expires: 999 }); // expires in 7 days (adjust as needed)
  };
  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(SERVER_IP + "/api/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setUserToken(data.token);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const scheduleEvent = async () => {
    try {
      const response = await fetch(SERVER_IP + "/api/schedule_event", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientPhoneNumber: phoneNumber,
          serviceCost: servicePrice,
          clientName: clientName,
          serviceName: servicesToString(service), //transform array in a string
          professional: professional,
          appointmentTime: selectedHour,
          appointmentDate: selectedData,
          serviceDuration: serviceDuration,
          keyForSet: artistIndex
        }),
      });
      if (response.ok) {
        const data = await response.json();
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  async function verifyOTP() {
    let otpValue = otp.join("");

    await fetch(SERVER_IP + "/api/verify-code", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otpValue }),
    }).then((response) => {
      setOtp(["", "", "", "", "", ""]);
      if (response.ok === true) {
        {
          //redirectToCheckout();
          sendConfirmationDetails();
        }
      }
    });
  }

  async function allAppointments() {
    console.log(
      JSON.stringify({ minDate: formatDateFromDateString(selectedData) })
    );

    console.log("selectedHour", selectedHour);
    console.log("serviceDuration", serviceDuration);
    console.log("selectedData", selectedData);
    try {
      const response = await fetch(SERVER_IP + "/api/showEvents", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          minDate: formatDateFromDateString(selectedData),
          keyForSet: artistIndex
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAppointmentsData(data);
        console.log("toate programarile", data);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }




  useEffect(() => {
    checkAvailableHours("10:00", "18:00");
  }, [appointmentsData]);

  useEffect(() => {
    // if (stage === 5) scheduleEvent();
    /* if (stage === 4) {
      const intervalId = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1); // Rename seconds to timer
        }
      }, 1000);

      return () => {
        clearInterval(intervalId); // Clean up the timer when the component unmounts
      };  
    }
    */
  }, [stage, timer]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1); // Rename seconds to timer
      }
    }, 1000);

    return () => {
      clearInterval(intervalId); // Clean up the timer when the component unmounts
    };
  }, [selectedHour, timer]);
  useEffect(() => {
    allAppointments();
    console.log(appointmentsData);
  }, [selectedData]);
  useEffect(() => {
    console.log("allCustomers: ", allCustomers);
  }, [loadingCustomers, allCustomers]);
  return (
    <div className=" flex flex-col items-center justify-center w-screen h-full py-[5rem] lg:py-[10rem]">
      <div className={`flex flex-col items-center ${!Cookies.get("token") && "hidden"}`}>
        <div className={`flex flex-col lg:flex-row gap-4`}>
          <button
            className="font-bold bg-green-500 px-8 py-2 text-white text-[18px] transition ease-in-out duration-[.3s] rounded-[8px] hover:bg-[#0B2A24] "
            onClick={() => setAction(0)}
          >
            Creeaza o programare
          </button>
          <button
            className="font-bold bg-green-500 px-8 py-2 text-white text-[18px] transition ease-in-out duration-[.3s] rounded-[8px] hover:bg-[#0B2A24]  "
            onClick={() => {
              console.log("da");
              setLoadingCustomers(true);
              showAllCustomers();
            }}
          >
            Arata toti clientii
          </button>
        </div>
        <div className={`flex-col flex-wrap list-none items-center  w-full h-full`}>
        {loadingCustomers ? (
  <li>Loading</li>
) : (
  allCustomers[0]!=1 && 
  <>
    <input
      className="mt-[.5rem] lg:mt-[1rem] w-full h-[2rem] border-[1px] border-black"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
    />
    <ul className="items-start lg:grid lg:grid-cols-2 gap-10">
      {allCustomers.map((customer, index) =>
        (searchName === "" || (searchName !== "" && customer[0].toLowerCase().includes(searchName.toLowerCase()))) && (
          <li
            className="text-[16px] lg:text-[20px] my-4 lg:my-2 flex flex-col items-center"
            key={index}
          >
            <strong>{customer[0]}</strong> 
            <button disabled={sendButton[index]} onClick={()=>sendManualComfirmation(comfirmationMessage.find((str) => str.includes(customer[0])),customer[1][0].substring(customer[1][0].indexOf("+"),customer[1][0].indexOf("+")+13),index)} className={`${sendButton[index] ? "border-[1px] border-red-500 text-black":"bg-green-500 text-white"}  w-full py-2 font-bold rounded-[8px]`}> {sendButton[index] ? "Trimis": "Trimite comfirmare"}</button>
            <textarea className="h-[5.3rem] w-full p-2 text-[16px]"
  onChange={(e) => {
    const updatedMessages = [...comfirmationMessage];
    const index = comfirmationMessage.findIndex((str) => str.includes(customer[0]));
    
    if (index !== -1) {
      updatedMessages[index] = e.target.value;
      setComfirmationMessage(updatedMessages);
    }
  }}
  value={comfirmationMessage.find((str) => str.includes(customer[0])) || ''}
/>
            
            - Programari:{" "}
            {customer[1].map((date, dateIndex) => (
              <span className="font-semibold px-2" key={dateIndex}>
                {date}
              </span>
            ))}
   
            <span className="mt-[1rem] w-full bg-gray-500 h-[1px] lg:hidden"/>
          </li>
        ) 
      )}
    </ul>
  </>
)}

        </div>
      </div>
      <div
        className={`flex justify-center items-center w-full h-screen ${
          Cookies.get("token") && "hidden"
        }`}
      >
        <form
          onSubmit={(e) => login(e)}
          className="flex flex-col gap-4 shadow-xl p-8 w-[20rem] lg:w-[25rem]"
        >
          <div className="flex flex-col gap-1">
            <label>Email:</label>
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              type="email"
              className=" px-2 py-1 border-[1px] border-gray-500 rounded-[5px]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Parola:</label>
            <input
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              type="password"
              className=" px-2 py-1 border-[1px] border-gray-500 rounded-[5px]"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white w-full py-2 font-bold"
          >
            LOGIN
          </button>
        </form>
      </div>
      <div
        className={` flex flex-col items-center   text-center w-[90%] h-full gap-[1rem] lg:gap-[2rem] ${
          (!Cookies.get("token") || action !== 0) && "hidden"
        }`}
      >
        <ul className="flex w-full lg:w-[40rem] justify-between  ">
          <button
            onClick={() => setStage(0)}
            className={`relative flex flex-col items-center justify-center rounded-[8px]  w-[5rem] lg:w-[6.5rem] h-[3.5rem] lg:h-[4.5rem] ${
              stage === 0 && "bg-green-500 text-white"
            } `}
          >
            <span className="absolute top-0 left-1 font-bold">1</span>
            <span className="text-[18px] lg:text-[22px]">
              <SlUserFemale />
            </span>
            <span className=" text-[14px] lg:text-[18px]">Stilistul</span>
          </button>
          <button
            onClick={() => {
              if (professional) setStage(1);
            }}
            className={`relative flex flex-col items-center justify-center rounded-[8px]  w-[5rem] lg:w-[6.5rem] h-[3.5rem] lg:h-[4.5rem] ${
              stage === 1 && "bg-green-500 text-white"
            } `}
          >
            <span className="absolute top-0 left-1 font-bold">2</span>
            <span className="text-[18px] lg:text-[22px]">
              <GoTasklist />
            </span>
            <span className=" text-[14px] lg:text-[18px]">Serviciul</span>
          </button>
          <button
            onClick={() => {
              if (professional && service && serviceButton) setStage(2);
            }}
            className={`relative flex flex-col items-center justify-center rounded-[8px]  w-[5rem] lg:w-[6.5rem] h-[3.5rem] lg:h-[4.5rem] ${
              stage === 2 && "bg-green-500 text-white"
            } `}
          >
            <span className="absolute top-0 left-1 font-bold">3</span>
            <span className="text-[18px] lg:text-[22px]">
              <BsCalendar3 />
            </span>

            <span className=" text-[14px] lg:text-[18px]">Data si Ora</span>
          </button>
          <button
            onClick={() => {
              if (professional && service && selectedHour && paymentStatus)
                setStage(3);
            }}
            className={`relative flex flex-col items-center justify-center rounded-[8px]  w-[5rem] lg:w-[6.5rem] h-[3.5rem] lg:h-[4.5rem] ${
              stage === 3 && "bg-green-500 text-white"
            } `}
          >
            <span className="absolute top-0 left-1 font-bold">4</span>
            <span className="text-[18px] lg:text-[22px]">
              <BsCalendarCheck />
            </span>
            <span className=" text-[14px] lg:text-[18px]">Finalizare</span>
          </button>
        </ul>

        {stage === 0 ? (
          <div className=" grid grid-cols-2 lg:flex gap-8 ">
            <Profesionist
              namePro="Gabriela"
              onClick={() => {
                setPaymentAppear(false);
                setClientName("");
                setPhoneNumber("");
                setProfessional("Gabriela");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(3);
                setArtistIndex(3);
              }}
              artistPhoto={Gabriela}
              selected={professional === "Gabriela"}
            />
            <Profesionist
              namePro="Stefania"
              onClick={() => {
                setPaymentAppear(false);
                setClientName("");
                setPhoneNumber("");
                setProfessional("Stefania");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(0);
                setArtistIndex(0);
              }}
              artistPhoto={Stefania}
              selected={professional === "Stefania"}
            />
            <Profesionist
              namePro="Diana"
              onClick={() => {
                setPaymentAppear(false);
                setClientName("");
                setPhoneNumber("");
                setProfessional("Diana");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(1);
                setArtistIndex(1);
              }}
              artistPhoto={Diana}
              selected={professional === "Diana"}
            />
            <Profesionist
              namePro="Catalina"
              onClick={() => {
                setPaymentAppear(false);
                setClientName("");
                setPhoneNumber("");
                setProfessional("Catalina");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(2);
                setArtistIndex(2);
              }}
              artistPhoto={Catalina}
              selected={professional === "Catalina"}
            />
          </div>
        ) : stage === 1 ? (
          <div className={` flex flex-col items-center w-full h-full`}>
            {data.profesionisti.map(
              (provider) =>
                provider.name === professional &&
                provider.services.map((serviciu) => (
                  <Service
                    nameServ={serviciu.name}
                    price={serviciu.price}
                    duration={serviciu.duration}
                    selected={service?.includes(serviciu.name)}
                    onClick={() => {
                      setClientName("");
                      setPhoneNumber("");
                      setPaymentAppear(false);
                      if (service?.includes(serviciu.name))
                        setService(
                          service.filter(
                            (eachService) => eachService != serviciu.name
                          )
                        );
                      else setService([...service, serviciu.name]);
                      setServiceDuration(
                        durationsAddition(
                          serviceDuration,
                          serviciu.duration,
                          service?.includes(serviciu.name)
                        )
                      );
                      console.log("serviciu.duration:", serviciu.duration);
                      setServicePrice(
                        pricesAddition(servicePrice, serviciu.price)
                      );
                      setSelectedHour("");
                      console.log(serviciu.duration);
                    }}
                  />
                ))
            )}
            <button
              onClick={() => {
                setServiceButton(true);
                if (service.length > 0) {
                  setStage(2);
                  window.scrollTo({ top: 0, left: 0 });
                }
              }}
              className={`mt-2 lg:mt-4 w-full lg:w-[40rem] font-bold text-white py-2 lg:py-4 px-8   rounded-[5px] transition  text-[13px] lg:text-[18px] ${
                serviceDuration !== ""
                  ? " bg-green-500 transition transition-[.3s] ease-in-out  hover:bg-green-600"
                  : " bg-red-500"
              }`}
            >
              {serviceDuration !== ""
                ? "CONTINUARE"
                : "SELECTEAZA CEL PUTIN UN SERVICIU"}
            </button>
          </div>
        ) : stage === 2 ? (
          <div
            className={`flex bg-white p-8 gap-8 shadow-xl flex-col lg:flex-row items-center justify-center overflow-hidden ${
              stage >= 2 ? "h-full" : "h-0"
            }`}
          >
            <div className="flex flex-col items-start">
              <Calendar
                onChange={(data) => {
                  selectData(data);
                  console.log(data.getMonth());
                }}
                value={selectedData}
                tileDisabled={({ date }) => isDateDisabled(date)}
              />

              <div className="mt-[1rem] lg:mt-[2rem] flex justify-center flex-wrap gap-2 w-full lg:w-[22rem] ">
                {
                  /*availableHours.map((hour) => {
                return (
                  <div
                    onClick={() => {
                      setSelectedHour(hour);
                    }}
                    className="cursor-pointer p-2 font-bold text-[15px] lg:text-[18px] bg-green-500 text-white hover:bg-green-600 transition ease-in-out "
                  >
                    {hour}
                  </div>
                );
              })
       
              appointmentsData?.map((appointment)=>{
                  return (
                    <div
                    onClick={() => {
                      setSelectedHour(appointment.start.dateTime);
                    }}
                    className="cursor-pointer p-2 font-bold text-[15px] lg:text-[18px] bg-green-500 text-white hover:bg-green-600 transition ease-in-out "
                  >
                    {combinedTime(appointment.start.dateTime)}
                   
                  </div>
                  )
              })
              */
                  availableHours?.map((hour) => {
                    return (
                      <div
                        onClick={() => {
                          if (appearPayment) {
                            setPaymentAppear(false);
                          }
                          setSelectedHour(hour);
                        }}
                        className={`cursor-pointer p-2 font-bold text-[14px] lg:text-[18px] bg-green-500 text-white hover:bg-green-600 transition ease-in-out ${
                          selectedHour === hour && "bg-green-600 size-[1.1]"
                        }`}
                      >
                        {hour}
                      </div>
                    );
                  })
                }
              </div>
            </div>
            <div className="flex flex-col">
              <div className={`text-[13px] lg:text-[18px] `}>
                {selectedData && selectedHour && (
                  <>
                    <div className="flex flex-col items-center  w-full">
                      <div className="flex flex-col w-[17rem] lg:w-[23rem]">
                        <p className="w-full text-left leading-5">
                          Introduceti mai jos numarul de telefon si numele
                          complet, apoi apasati pe confirm
                        </p>
                        <div className="flex flex-col gap-2">
                          <form
                            ref={form}
                            onSubmit={(e) => handleForm(e)}
                            className="mt-[.8rem] lg:mt-[1.3rem] flex flex-col gap-2 lg:gap-4 w-full "
                          >
                            <input
                              type="text"
                              name="phoneNumber"
                              value={phoneNumber}
                              className="hidden "
                            />
                            <input
                              type="text"
                              name="service"
                              value={service}
                              className="hidden "
                            />
                            <input
                              type="text"
                              name="profesionist"
                              value={professional}
                              className="hidden "
                            />
                            <input
                              type="text"
                              name="date"
                              value={selectedData}
                              className="hidden "
                            />
                            <input
                              type="text"
                              name="hour"
                              value={selectedHour}
                              className="hidden "
                            />

                            <div className="flex flex-col items-start">
                              <input
                                type="text"
                                minLength={8}
                                maxLength={15}
                                placeholder="Numar de telefon ex: +40712345689"
                                value={phoneNumber}
                                onChange={(e) => {
                                  if (
                                    isDigitOrBackspace(
                                      e.target.value[e.target.value.length - 1]
                                    ) ||
                                    e.target.value === ""
                                  )
                                    setPhoneNumber(e.target.value);
                                }}
                                className="mt-2 p-2 rounded-[8px] outline-green-500 border-[1px] border-gray-500 w-full"
                                required
                              />
                              <p className="mt-2 text-left">
                                Exemplu: +40712345678 (prefixul trebuie inclus
                                obligatoriu)
                              </p>
                            </div>
                            <input
                              type="text"
                              name="clientName"
                              placeholder="Nume si prenume"
                              className="p-2 rounded-[8px] outline-green-500 border-[1px] border-gray-500 w-full"
                              value={clientName}
                              onChange={(e) => {
                                setClientName(e.target.value);
                              }}
                              required
                            />
                            <div className="flex justify-center my-[.5rem] flex w-full lg:w-[20rem]">
                              <span
                                onClick={() => {
                                  if (!checkTerms) setCheckTerms(true);
                                  else setCheckTerms(false);
                                }}
                                className={`flex justify-center items-center text-[15px] lg:text-[22px] mr-2 cursor-pointer min-w-[20px] lg:min-w-[30px]  h-[22px] lg:h-[30px] border-[2px] border-green-600 text-white  ${
                                  checkTerms && "bg-green-500"
                                }`}
                              >
                                {checkTerms && <AiOutlineCheck />}
                              </span>
                              <p className="text-left text-[13px] lg:text-[16px]">
                                Bifand aceasta casuta confirmi ca esti de acord
                                cu{" "}
                                <a
                                  className="cursor-pointer font-bold"
                                  onClick={() => {
                                    navigate("/termeni-si-conditii-avans");
                                    window.scrollTo({ top: 0, left: 0 });
                                  }}
                                >
                                  Termenii si conditiile, GDPR si Politica de
                                  confidentialitate.
                                </a>
                              </p>
                            </div>
                            <button
                              type="submit"
                              className={`  font-montSerrat   text-[14px] lg:text-[18px] w-full h-[2.2rem] lg:h-[3rem] rounded-[8px] font-bold  ${
                                appearPayment
                                  ? "bg-transparent text-green-500"
                                  : "bg-green-500 hover:bg-green-600 transition ease-in-out duration-300 text-white"
                              }`}
                              disabled={appearPayment}
                            >
                              {appearPayment ? "Confirmat" : "Confirm"}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : stage === 3 ? (
          <div className=" flex flex-col items-start px-2 gap-1 text-[12px] lg:text-[20px] w-[90%] lg:w-[40rem]">
            <h4>Serviciul ales: {servicesToString(service)}</h4>
            <h4>Profesionistul: {professional}</h4>
            <h4>
              Data: {selectedData.getDate()}-{selectedData.getUTCMonth() + 1}-
              {selectedData.getUTCFullYear()}{" "}
            </h4>
            <h4>
              Intervalul orar: {selectedHour}-
              {(
                parseInt(selectedHour.split(":")[0]) +
                parseInt(serviceDuration.split(":")[0])
              ).toString() +
                ":" +
                (
                  parseInt(selectedHour.split(":")[1]) +
                  parseInt(serviceDuration.split(":")[1])
                ).toString() +
                ((
                  parseInt(selectedHour.split(":")[1]) +
                  parseInt(serviceDuration.split(":")[1])
                ).toString() === "0"
                  ? "0"
                  : "")}{" "}
            </h4>
            <hr className="w-full bg-black h-[1px]" />
          </div>
        ) : stage === 4 ? (
          <div className="flex flex-col items-start px-2 gap-1 text-[12px] lg:text-[20px] w-[90%] lg:w-[27rem] ">
            <h4>Serviciul ales: {servicesToString(service)}</h4>
            <h4>Profesionistul: {professional}</h4>
            <h4>
              Data: {selectedData.getDate()}-{selectedData.getUTCMonth() + 1}-
              {selectedData.getUTCFullYear()}{" "}
            </h4>
            <h4>
              Intervalul orar: {selectedHour}-
              {(
                parseInt(selectedHour.split(":")[0]) +
                parseInt(serviceDuration.split(":")[0])
              ).toString() +
                ":" +
                (
                  parseInt(selectedHour.split(":")[1]) +
                  parseInt(serviceDuration.split(":")[1])
                ).toString() +
                ((
                  parseInt(selectedHour.split(":")[1]) +
                  parseInt(serviceDuration.split(":")[1])
                ).toString() === "0"
                  ? "0"
                  : "")}{" "}
            </h4>

            <div className="flex justify-between w-[16.5rem] lg:w-[27rem] "></div>
          </div>
        ) : (
          stage === 5 && (
            <div className="flex flex-col items-center text-[20px] lg:text-[32px] ">
              <div></div>
              <p>Iti multumim pentru programare</p>
              <p>
                Te asteptam pe data de{" "}
                <span className="font-bold">
                  {selectedData.getDate()}-{selectedData.getMonth() + 1}-
                  {selectedData.getUTCFullYear()} <br />{" "}
                </span>{" "}
                la ora <span className="font-bold">{selectedHour}</span>
              </p>
            </div>
          )
        )}

        {/*<h2 className="font-roboto font-[300] text-[22px] lg:text-[36px] ">
        <span className="text-[30px] lg:text-[54px] font-extrabold text-gray-300 ">2 </span>Alege serviciul
      </h2>*/}

        {/*<h2 className="font-roboto font-[300] text-[22px] lg:text-[36px]">
          <span className="text-[30px] lg:text-[54px] font-extrabold text-gray-300">3 </span>Alege data si ora
      </h2>*/}

        {/* <h2 className="font-roboto font-[300] text-[22px] lg:text-[36px]">
          <span className="text-[30px] lg:text-[54px] font-extrabold text-gray-300">4 </span>Finalizeaza programarea
          </h2>*/}
      </div>
    </div>
  );
};

export default Appointment;
