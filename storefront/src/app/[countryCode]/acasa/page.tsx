import React from 'react'
import Curs from '../../../../public/Imagini/cursuri/cursDeBaza_preview.jpg'
import Image from 'next/image'


const page = () => {
  return (
    <div className='flex justify-center w-full'>
    <div className=' grid grid-cols-1 lg:grid-cols-2 gap-[24px] align-center justify-items-center'>
        <Image src={Curs} width={500} />
        <Image src={Curs} width={500} />
        <Image src={Curs} width={500} />
        <Image src={Curs} width={500} />

    </div>
    </div>
  )
}

export default page   