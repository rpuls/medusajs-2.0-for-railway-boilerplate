"use client"; // Aceasta este o Client Component
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function InteractiveList() {
  return (
    <ul className='w-[10rem] mt-[1rem] lg:mt-0'>
      <li className='font-bold'>Navigare</li>
      <li className='mt-[1rem] cursor-pointer text-[14px]'>
        <LocalizedClientLink
          activeClass="active"
          to="Hero"
          spy={true}
          smooth={true}
          offset={-50}
          duration={500}
        >
          ACASA
        </LocalizedClientLink>
      </li>
      <li className='cursor-pointer text-[14px]'>
        <LocalizedClientLink
          activeClass="active"
          to="DespreNoi"
          spy={true}
          smooth={true}
          offset={-50}
          delay={200}
          duration={500}
        >
          DESPRE NOI
        </LocalizedClientLink>
      </li>
      <li onClick={() => { window.scrollTo({ top: 0, left: 0 }) }} className='cursor-pointer text-[14px]'>
        ECHIPA
      </li>
      <li className='cursor-pointer text-[14px]'>
        <LocalizedClientLink
          activeClass="active"
          to="Contact"
          spy={true}
          smooth={true}
          offset={-50}
          duration={500}
        >
          CONTACT
        </LocalizedClientLink>
      </li>
      <li className='cursor-pointer' onClick={() => { window.scrollTo({ top: 0, left: 0 }) }}>
        ADMIN
      </li>
    </ul>
  );
}
