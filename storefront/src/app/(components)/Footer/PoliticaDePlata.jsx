import React from 'react'

const PoliticaDePlata = () => {
  return (
    <div className='flex flex-col justify-center items-center font-montSerrat cl
    w-full py-[10rem]'>
        <div className='flex flex-col justify-center items-start w-[90%] lg:w-[60rem] '>

        <h1 className='text-[24px] lg:text-[38px] font-bold'> POLITICA DE PLATĂ</h1>
        <h2 className= 'text-[18px] lg:text-[24px] font-bold text-gray-400 '>PLATA ONLINE CU CARDUL</h2>
        <p>
            Pentru efectuarea plății online, se acceptă atât cardurile personale, cât și cele de business, în aceleași condiții de siguranță maximă. Cardurile acceptate sunt cele emise sub siglele VISA (Classic și Electron) și MASTERCARD (inclusiv Maestro, dacă au codul CVV2/CVC2).
        </p>
        <p>
            În vederea garantării securității tranzacțiilor, platforma utilizată de www.lorenalash.ro este STRIPE.
        </p>
        <p>
            Pentru a finaliza tranzacția cu succes, trebuie să introduceți datele necesare autorizării plății în platforma de plăți. În cazul în care cardul este asociat cu un cont în altă monedă decât LEI, tranzacțiile se vor realiza în LEI, la cursul de schimb al băncii emitente pentru cardul respectiv.
        </p>
        <p>
            Procesarea datelor de card se realizează exclusiv prin intermediul platformei de plată STRIPE. Compania LORENA DANOIU LASH SRL nu solicită și nu stochează nicio informație referitoare la cardul dumneavoastră.
        </p>
        </div>
    </div>
  )
}

export default PoliticaDePlata