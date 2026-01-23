"use client"

import { useEffect } from "react"
import { setCollectionCookie } from "@lib/utils/personalization-cookies"

type TrackCollectionVisitProps = {
    collectionId: string
}

export default function TrackCollectionVisit({ collectionId }: TrackCollectionVisitProps) {
    useEffect(function trackCollectionVisit() {
        if (collectionId) {
            setCollectionCookie(collectionId)
        }
    }, [collectionId])

    return null
}

