"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { SortOptions } from "./sort-products"
import SortProducts from "./sort-products"

type MobileFilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
}

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  sortBy,
  setQueryParams,
}: MobileFilterDrawerProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-modal">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background-overlay" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="w-full bg-white rounded-t-lg shadow-xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
                <Dialog.Title className="text-xl font-semibold text-text-primary">
                  Filters
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background-elevated rounded-md transition-colors"
                  aria-label="Close filters"
                >
                  <XMark className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default MobileFilterDrawer

