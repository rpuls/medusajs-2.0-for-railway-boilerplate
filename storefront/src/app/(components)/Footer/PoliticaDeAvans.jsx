import React from 'react';

const PoliticaDeAvans = ()=>{
    return(
        <div className='flex flex-col justify-center items-center font-montSerrat cl
        w-full py-[10rem]'>
            <div className='flex flex-col justify-center items-start w-[90%] lg:w-[60rem] '>
                <h1 className='text-[24px] lg:text-[38px] font-bold'>
                    Acordul clientului in vederea achitarii avansului
                </h1>
     
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                    PLATA AVANSULUI
                </h2>
                <p>
                Pentru a va asigura valabilitatea programarii, este necesara achitarea unui avans in timpul efectuarii programarii. 
                </p>
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                    (1)Prin achitarea avansului sunteti de acord cu urmatoarele:
                </h2>
                <ul className='list-decimal'>
                <li >Anularea sau amanarea programarii duce la pierderea avansului.</li>
                <li>Mutarea programarii la un alt lash artist / brow artist din cadrul salonului duce la pierderea avansului</li>
                <li>Avansul este individual si nu poate fi cumulat cu alte programari in cazul programarilor de grup.</li>
                <li>Intarzierea sau neprezentarea la data si ora stabilita pentru programare duce la pierderea avansului</li>
                </ul>
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                    (2) OBLIGATIILE PARTILOR
                </h2>
                <p>
                    PRESTATORUL se obliga:
                </p>
                <ul className='list-decimal'>
                    <li>sa ofere serviciile si produsele stabilite la data programarii de comun acord cu BENEFICIARUL;</li>
                    <li>sa respecte standardele de calitate si igiena pentru serviciile si produsele oferite;</li>
                    <li>sa depuna toate eforturile pentru a multumi BENEFICIARUL, demonstrand solicitudine si profesionalism.</li>
                    <li>sa anunte BENEFICIARUL si sa inlocuiasca persoana responsabila pentru programare in cazul in care cel responsabil initial este in incapacitate de a oferi serviciile prestate, neafectand calitatea serviciilor oferite</li>
                </ul>
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                    BENEFICIARUL se obliga:
                </h2>
                <ul className='list-decimal'>
                    <li>sa informeze corect si complet prestatorul asupra solicitarii sale;</li>
                    <li>sa achite contravaloarea avansului la cel mult 5 zile de la data efectuarii programarii;</li>
                    <li>sa respecte indicatiile primite in vederea pregatirii pentru programare;</li>
                    <li>sa se prezinte la programare cu cel mult 15 minute inainte de ora stabilita;</li>
                    <li>sa achite diferenta de plata pana la valoarea serviciilor oferite la finalul prestarii acestora.</li>
                </ul>
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                    (3)  FORTA MAJORA
                </h2>
                <p>
                Restituirea sau realocarea avansului este posibila doar in situatie de forta majora, dupa cum urmeaza:
                </p>
                <p>
                Forta majora, astfel cum este definita de lege, exonereaza de raspundere partea care o invoca.
                </p>
                <p>
                Partea care invoca forta majora este obligate sa notifice celeilalte parti, in termen de 5 zile de la  producerea evenimentului si sa ia toate masurile posibile in vederea limitarii consecintelor lui.
                </p>
                <p>
                Daca in teren de 5 zile de la producerea evenimentului respectiv nu inceteaza, partile au dreptul sa-si notifice incetarea de drept a prezentului acord fara ca vreuna dintre ele sa pretinda daune – interese.
                </p>
                <h2 className='text-[16px] lg:text-[20px] font-bold mt-[.5rem]'>
                (4) RASPUNDEREA PARTILOR
                </h2>
                <p>In cazul in care BENEFICIARUL renunta la serviciile stabilite, avansul achitat nu va fi restituit
In cazul in care PRESTATORUL nu isi poate executa obligatiile asumate va despagubi BENEFICIARUL cu o suma reprezentand contravaloarea AVANSULUI</p>
            </div>
        </div>
    )
}

export default PoliticaDeAvans