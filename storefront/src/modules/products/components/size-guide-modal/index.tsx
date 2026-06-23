"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import SizeFinder from "@modules/common/components/size-finder"
import { SizeChartType } from "@lib/data/size-charts"

type Props = {
  defaultType?: SizeChartType
}

const SizeGuideModal = ({ defaultType = "binder" }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-hanken text-sm font-semibold text-kin-forest hover:underline flex items-center gap-1 focus:outline-none"
      >
        Hướng dẫn chọn size
        <span className="material-symbols-outlined text-[16px]">
          straighten
        </span>
      </button>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[80]" onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl bg-kin-surface p-6 md:p-8 shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <Dialog.Title className="font-hanken text-2xl font-bold text-kin-primary tracking-tight">
                      Hướng dẫn chọn size
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-kin-on-surface-variant hover:text-kin-primary transition-colors focus:outline-none"
                      aria-label="Đóng"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <SizeFinder defaultType={defaultType} compact />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default SizeGuideModal
