import React from 'react'
import cursDeBaza from '../../../../public/Imagini/cursuri/cursDeBaza_preview.jpg'
import cursDePerfectionare from '../../../../public/Imagini/cursuri/cursDeBaza_preview.jpg'
import cursVip from '../../../../public/Imagini/cursuri/cursDeBaza_preview.jpg'
import CursMainPreview from '../../(components)/Courses/CursMainPreview'

const page = () => {
  return (
    <div className='flex flex-col justify-center items-center w-full h-full py-[5rem] lg:py-[10rem]'> 
        <div className='w-[90%]'>
            <h1 className='text-[38px] lg:text-[64px] font-oswald font-bold text-center'>CURSURI</h1>
            <h2 className='text-center lg:text-[22px] font-oswald'>Trebuie sa platesti acum doar avansul de 500 de lei si ne vedem la curs</h2>
        </div>
        <div className='relative lg:ml-[2rem] mt-[1rem]  flex flex-col items-center w-[90%] lg:w-[40rem]'>
        <CursMainPreview imagine={cursDeBaza} titlu="Curs de baza 1D-3D & Foxy Intensiv Bucuresti" subTitlu="Curs de baza" descriere="Iti doresti sa ai propria ta AFACERE si sa-ti urmezi visul in domeniul BEAUTY? Acum este momentul sa CREZI in tine si sa FACI primul pas catre o noua CARIERA! Ne vom asigura ca drumul tau in lumea extensiilor de gene va duce catre SUCCES" redirectionare="curs-de-baza"  baza={true} />
            <CursMainPreview imagine={cursDePerfectionare} titlu="Curs de Efecte Speciale Bucuresti" subTitlu="Curs de efecte special" secondTitle="Cui i se adreseaza?"  descriere=" 

Tehnicienilor care au finalizat un curs de baza, au experienta minim 3 luni si doresc sa-si imbunatateasca tehnica, de asemenea, pot invata sa aplice noi curburi, tehnici si metode!
Vom rezolva problemele fiecarui cursant si vom adapta totul in functie de acestia! " redirectionare="curs-de-perfectionare" baza={false} />
          <CursMainPreview imagine={cursVip} subTitlu="Doar tu si trainerul" secondTitle="*Posibilitate cu translator & alegerea datelor 
" titlu="Curs VIP de baza Bucuresti"  descriere="Te-ai gandit vreodata ca iti doresti sa participi la un curs de baza unde toata atentia trainerului sa fie indreptata asupra ta? Atunci cursul VIP este alegerea perfcta pentru tine! 

Iti doresti sa ai propria ta AFACERE si sa-ti urmezi visul in domeniul BEAUTY? Acum este momentul sa CREZI in tine si sa FACI primul pas catre o noua CARIERA! Ne vom asigura ca drumul tau in lumea extensiilor de gene va duce catre SUCCES"  redirectionare="curs-vip-de-baza" baza={false} />
        </div>
    </div>
  )
}

export default page