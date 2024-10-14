import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InteractiveList from "./InteractiveList"; 
import Image from 'next/image' // Importă componenta Image
import SAL from '../../../../../public/Imagini/SAL.svg'
import SOL from '../../../../../public/Imagini/SOL.svg'

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="border-t border-ui-border-base w-full relative flex flex-col justify-center items-center bg-gradient-to-t from-[#F9C6E7] to-[#fa8ad3] w-full h-full pt-[5rem] pb-[1rem] text-white font-montSerrat">
      <span className='absolute top-0 left-0 w-screen h-[.5rem] bg-white'/>
      <div className='w-[90%] lg:w-[60rem] flex flex-col items-center lg:items-start lg:grid lg:grid-cols-4'>
        <div className='flex flex-col mt-0'>
          <h4>LORENA DANOIU LASH SRL</h4>
          <h4>CUI: 46510830 | J40/13973/2022</h4>
        </div>
        <InteractiveList/>
        <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
          <li className='font-bold '>Conditii</li>
          <li className='mt-[1rem] cursor-pointer text-[14px]'>Politica de utilizare</li>
          <li className='cursor-pointer text-[14px]'>Politica de inscriere</li>
          <li className='cursor-pointer text-[14px]'>Politica de plata</li>
          <li className='cursor-pointer text-[14px]'>Politica de returnare</li>
          <li className='cursor-pointer text-[14px]'>Termeni si conditii</li>
        </ul>
        <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
          <li className='font-bold '>Echipa</li>
          <li className='mt-[1rem] cursor-pointer text-[14px]'>Lorena Danoiu (Trainer)</li>
          <li className='cursor-pointer text-[14px]'>Diana Elena Cotet (Master)</li>
          <li className='cursor-pointer text-[14px]'>Damian Denisa (Master)</li>
          <li className='cursor-pointer text-[14px]'>Catalina Trica (Brow Artist)</li>
        </ul>
      </div>
      <div className='flex mt-[3rem] flex-col-reverse lg:flex-row justify-between items-center lg:items-end w-full lg:w-[60rem]'> 
        <a title="Firma creare site de prezentare" href="https://www.waygital.ro/" className='relative flex'>  Site creat de </a>
        <div className='flex flex-col items-center'>
          <div className='flex items-center w-[12rem] justify-between'>
            <div className='bg-stripe bg-cover w-[70px] h-[35px]'/>
            <div className='bg-visa bg-cover w-[45px] h-[25px]'/>
            <div className='bg-masterCard bg-cover w-[50px] h-[30px]'/>
          </div>
          <h5>@2023 Cursuri gene - Lorena Lash Studio </h5>
        </div>
        <div className='relative flex flex-col mb-[2rem] lg:mb-0'>
          <a href="https://anpc.ro/ce-este-sal/">
            <Image src={SAL} alt="SAL" width={185} height={50} />
          </a>
          <a href="https://ec.europa.eu/consumers/odr">
            <Image src={SOL} alt="SOL" width={185} height={50} />
          </a>
        </div>
      </div>
    </footer>
  )
}
