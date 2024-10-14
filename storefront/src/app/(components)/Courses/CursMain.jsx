import React from 'react'
import CursMainPreview from './CursMainPreview'
import cursDeBaza from './Imagini/cursDeBaza_preview.jpg'
import cursVip from './Imagini/cursVip.jpeg'
import cursDePerfectionare from './Imagini/cursEfecteSpeciale.jpeg'
//import cursEfecteSpeciale from './Imagini/cursEfecteSpeciale.jpeg'
import {Fade} from 'react-reveal'
const CursMain = () => {

  return (
  <div className='relative font-montSerrat flex flex-col items-center justify-center h-full w-full py-[10rem]   bg-cover' >
      <Fade>
        <h2 className='relative  text-[28px] lg:text-[48px] font-bold  px-[10rem] py-[.5rem] rounded-[8px] bg-[#0b2a24] text-white'>
          CURSURI
        </h2>
        </Fade>
        <div className='relative lg:mt-[10rem] flex flex-col items-center '>
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

export default CursMain