"use client"

import { Popover, Transition } from "@headlessui/react"
import { ChevronDown } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useState } from "react"

type CategoryMenuItemProps = {
    category: HttpTypes.StoreProductCategory
}

const CategoryMenuItem = ({ category }: CategoryMenuItemProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren =
        category.category_children && category.category_children.length > 0

    if (!hasChildren) {
        return (
            <LocalizedClientLink
                href={`/categories/${category.handle}`}
                prefetch={false}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap font-medium"
            >
                {category.name}
            </LocalizedClientLink>
        )
    }

    return (
        <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="relative"
        >
            <Popover className="relative">
                <Popover.Button
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap font-medium outline-none"
                >
                    <LocalizedClientLink
                        href={`/categories/${category.handle}`}
                        prefetch={false}
                        className="hover:text-text-primary"
                    >
                        {category.name}
                    </LocalizedClientLink>
                    <ChevronDown className="w-4 h-4" />
                </Popover.Button>

                <Transition
                    show={isOpen}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <Popover.Panel static className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            {category.category_children?.map((child) => (
                                <LocalizedClientLink
                                    key={child.id}
                                    href={`/categories/${child.handle}`}
                                    prefetch={false}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    {child.name}
                                </LocalizedClientLink>
                            ))}
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    )
}

export default CategoryMenuItem
