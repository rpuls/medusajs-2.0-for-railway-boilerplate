import React, { useEffect, useState, useRef } from "react";
import { SlUserFemale } from "react-icons/sl";
import { GoTasklist } from "react-icons/go";
import { BsCalendar3, BsCalendarCheck } from "react-icons/bs";
import Profesionist from "./Profesionist";
import Service from "./Service";
import data from "./Services.json";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import Catalina from "./Images/Catalina.jpeg";
import Diana from "./Images/Diana.jpeg";
import Gabriela from "./Images/Gabriela.jpeg";
import Stefania from "./Images/Stefania.jpeg";

const Appointment = () => {
  const SERVER_IP = "https://backend-production-b11c.up.railway.app"; //de live
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [professional, setProfessional] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [service, setService] = useState([]);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+40");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedData, selectData] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("");
  const [timer, setTimer] = useState(60);

  const [appointmentsData, setAppointmentsData] = useState([]);
  const [serviceButton, setServiceButton] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [successfull, setSuccessfull] = useState(false);
  const [appearPayment, setPaymentAppear] = useState(false);
  const [detailsButton, setDetailsButton] = useState(false);
  const [artistIndex,setArtistIndex]=useState(-1);
  const form = useRef();
  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  const handleForm = async (e) => {
    e.preventDefault();
    setDetailsButton(true);
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
      if (response.ok) {
        setPaymentAppear(true);

        fetch(SERVER_IP + "/api/create-payment-intent", {
          method: "POST",
          body: JSON.stringify({}),
        }).then(async (r) => {
          var { clientSecret } = await r.json();
          setClientSecret(clientSecret);
        });
      } else {
        // Handle the error if needed
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error("Fetch error:", error);
    }
    emailjs
      .sendForm(
        "service_d9r6rus",
        "template_lb9xvln",
        form.current,
        "RUXGR3wPf5KOMGSuu"
      )
      .then(
        (result) => {},
        (error) => {
          console.log(error.text);
        }
      );
  };
  const isDigitOrBackspace = (input) => /^[0-9\b]$/.test(input);
  const combinedTime = (dateString) => dateString.slice(11, 16);
  const [availableHours, setAvailableHours] = useState([]);

  const [paymentStatus, setPaymentStatus] = useState(false);
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Calculate the date 3 months from now
  const threeMonthsLater = new Date();

  // Custom function to disable dates beyond 3 months from now
  const isDateDisabled = (date) => {
    const currentDate = new Date(); // Get the current date
    const twentyNovemberThisMonth = new Date(currentDate.getFullYear(), 10, 20); // November is month 10
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 1);

    return (
      (professional === "Gabriela" && date < twentyNovemberThisMonth) ||
      (professional === "Diana" &&
        date.getMonth() === 10 &&
        date.getDay() === 1) || // Monday in November for Diana
      date > threeMonthsLater ||
      isWeekend(date) || date.getMonth()===0
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

  useEffect(() => {
    console.log("paymentStatus:", paymentStatus);
    console.log(
      "conditia de verificare",
      service.every((element) =>
        ["Demontare", "Stilizare Sprancene"].includes(element)
      )
    );
    if (
      selectedHour !== "" &&
      (paymentStatus ||
        service.every((element) =>
          ["Demontare", "Stilizare Sprancene"].includes(element)
        )) &&
      clientName
    ) {
      //aici
      scheduleEvent();
      sendConfirmationDetails();

      setStage(5);

      window.scrollTo({ top: 0, left: 0 });
    }

    console.log(stage);
  }, [selectedHour, paymentStatus, detailsButton]);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");
    fetch(SERVER_IP + "/api/config").then(async (r) => {
      const { publishableKey } = await r.json();

      setStripePromise(loadStripe(publishableKey));
    });
    fetch(`/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {});
  }, []);

  const handleChange = (e, index) => {
    if (e.target.value.length < 2) {
      otp[index] = e.target.value;
      setOtp([...otp]);
    } else if (
      (e.target.value !== "" && index < 5) ||
      e.target.value.length > 1
    ) {
      otp[index + 1] = e.target.value[e.target.value.length - 1];
      setOtp([...otp]);
      inputRefs[index + 1].current.focus();
    }
  };
  const handleKeyUp = (e, index) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs[index - 1].current.focus();
    }
  };

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
        let pause=serviceDurationHour>=2 ? 30 : 0;
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


          console.log(  currentHour," ",appointmentStartHour);

          if (
            (currentHour === appointmentStartHour &&
              currentMinute >= appointmentStartMinute) ||
            (currentHour === appointmentEndHour &&
              currentMinute < appointmentEndMinute) ||
            (currentHour +
              serviceDurationHour +
              Math.floor((currentMinute + serviceDurationMinute+pause) / 60) >
              appointmentStartHour &&
              currentHour +
                serviceDurationHour +
                Math.floor((currentMinute + serviceDurationMinute+pause) / 60) <=
                appointmentEndHour) ||
            (currentHour < appointmentEndHour &&
              currentHour + serviceDurationHour +
                Math.floor((currentMinute + serviceDurationMinute+pause) / 60) >=
                appointmentEndHour)||
                (currentHour +
                  serviceDurationHour +
                  Math.floor((currentMinute + serviceDurationMinute+pause) / 60) >
                  appointmentStartHour && (currentMinute + serviceDurationMinute+pause) %60 >=appointmentStartMinute)
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
        setCodeSent(true);
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


  const handlePaymentStatus = (settedValue) => {
    setPaymentStatus(settedValue);
    console.log(settedValue);
  };

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

  return (
    <div className=" flex flex-col items-center justify-center w-screen h-full py-[5rem] lg:py-[10rem]">
      <div className=" flex flex-col items-center   text-center w-[90%] h-full gap-[1rem] lg:gap-[2rem]">
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
        <h2 className="font-roboto font-[300] text-[22px] lg:text-[36px] ">
          <span className="text-[30px] lg:text-[54px] font-extrabold text-gray-300 ">
            {stage === 0 ? "1" : stage === 1 ? "2" : stage === 2 ? "3" : "4"}{" "}
          </span>{" "}
          {stage === 0
            ? "Alege unul dintre stilisti"
            : stage === 1
            ? "Alege Serviciul"
            : stage === 2
            ? "Alege data si ora"
          : "Finalizarea programarii"}
        </h2>
        {stage === 0 ? (
          <div className=" grid grid-cols-2 lg:flex gap-8 ">
            <Profesionist
              namePro="Gabriela"
              onClick={() => {
                setClientName("");
                setPhoneNumber("+40");
                setPaymentStatus(false);
                setProfessional("Gabriela");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(3);
                setArtistIndex(3);
                setAvailableHours([]);
              }}
              artistPhoto={Gabriela}
              selected={professional === "Gabriela"}
            />
            <Profesionist
              namePro="Stefania"
              onClick={() => {
                setClientName("");
                setPhoneNumber("+40");
                setPaymentStatus(false);
                setProfessional("Stefania");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(0);
                setArtistIndex(0);
                setAvailableHours([]);
              }}
              artistPhoto={Stefania}
              selected={professional === "Stefania"}
            />
            <Profesionist
              namePro="Diana"
              onClick={() => {
                setClientName("");
                setPhoneNumber("+40");
                setPaymentStatus(false);
                setProfessional("Diana");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(1);
                setArtistIndex(1);
                setAvailableHours([]);
              }}
              artistPhoto={Diana}
              selected={professional === "Diana"}
            />
            <Profesionist
              namePro="Catalina"
              onClick={() => {
                setClientName("");
                setPhoneNumber("+40");
                setPaymentStatus(false);
                setProfessional("Catalina");
                setService([]);
                setSelectedHour("");
                setServiceDuration("");
                //setIndex(2);
                setArtistIndex(2);
                setAvailableHours([]);
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
                      setPhoneNumber("+40");
                      setPaymentAppear(false);
                      if (service?.includes(serviciu.name))
                        setService(
                          service.filter(
                            (eachService) => eachService !== serviciu.name
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
                          if(appearPayment)
                          {
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
                              <div
                                className={`mt-[1rem] flex items-center justify-center gap-1 lg:gap-2 ${
                                  !codeSent && "hidden"
                                }`}
                              >
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[0]}
                                  value={otp[0]}
                                  onChange={(e) => handleChange(e, 0)}
                                  onKeyUp={(e) => handleKeyUp(e, 0)}
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[1]}
                                  value={otp[1]}
                                  onChange={(e) => handleChange(e, 1)}
                                  onKeyUp={(e) => handleKeyUp(e, 1)}
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[2]}
                                  value={otp[2]}
                                  onChange={(e) => handleChange(e, 2)}
                                  onKeyUp={(e) => handleKeyUp(e, 2)}
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[3]}
                                  value={otp[3]}
                                  onChange={(e) => handleChange(e, 3)}
                                  onKeyUp={(e) => handleKeyUp(e, 3)}
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[4]}
                                  value={otp[4]}
                                  onChange={(e) => handleChange(e, 4)}
                                  onKeyUp={(e) => handleKeyUp(e, 4)}
                                />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="border-[2px] border-gray-400 w-[2.2rem] lg:w-[3rem] h-[2.7rem] lg:h-[3.7rem] text-center font-bold text-[20px] lg:text-[28px] rounded-[8px]"
                                  autoComplete="one-time-code"
                                  ref={inputRefs[5]}
                                  value={otp[5]}
                                  onChange={(e) => handleChange(e, 5)}
                                  onKeyUp={(e) => handleKeyUp(e, 5)}
                                />
                              </div>

                              <p
                                className={`text-left font-bold ${
                                  !codeSent && "hidden"
                                }`}
                              >
                                Ati primit un cod pe telefon, verificati
                                mesageria si introduceti-l mai jos
                              </p>
                              <div
                                className={`flex w-full justify-between ${
                                  !codeSent && "hidden"
                                }`}
                              >
                                <button
                                  onClick={sendCode}
                                  className={`mt-[.5rem] lg:mt-[1rem] font-montSerrat  text-[14px]  w-[6rem] lg:w-[8rem] h-[2.2rem] lg:h-[3rem] rounded-[8px]   ${
                                    timer === 0
                                      ? "lg:text-[22px] text-white bg-green-500 hover:bg-green-600 font-bold"
                                      : "text-black  bg-transparent lg:text-[18px]"
                                  } transition ease-in-out duration-300`}
                                  disabled={timer === 0 ? false : true}
                                >
                                  Retrimite {timer !== 0 && `(${timer})`}
                                </button>
                                <button
                                  onClick={verifyOTP}
                                  className="mt-[.5rem] lg:mt-[1rem] font-montSerrat text-white bg-green-500 text-[14px] lg:text-[22px] w-[6rem] lg:w-[8rem] h-[2.2rem] lg:h-[3rem] rounded-[8px] font-bold hover:bg-green-600 transition ease-in-out duration-300"
                                >
                                  Validare
                                </button>
                              </div>
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

                              <p className="text-left text-[13px] lg:text-[16px]">
                                Apasand pe butonul de mai jos, confirmi ca esti de acord
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
                    <div className={`flex flex-col items-center ${!appearPayment && "hidden"}`}>
                      {successfull ? (
                        <p className="font-bold">
                          Plata a fost realizata cu success
                        </p>
                      ) : (
                        <>
                          <h1 className="mt-4 w-[20rem] leading-5 ">
                            Plateste avansul de 100 lei acum si ne vedem la
                            programare la ora selectata
                          </h1>

                          {clientSecret && stripePromise && (
                            <Elements
                              stripe={stripePromise}
                              options={{ clientSecret }}
                            >
                              <CheckoutForm
                                setPaymentStatus={setPaymentStatus}
                              />
                            </Elements>
                          )}
                        </>
                      )}
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
