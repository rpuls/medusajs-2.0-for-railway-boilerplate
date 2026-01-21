import Image from "next/image"
import { Container, Heading, Text } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryImage = {
    url: string
    alt?: string
    width?: number
    height?: number
}

type ShopByCategoryCardProps = {
    href: string
    name: string
    description?: string | null
    image?: CategoryImage | null
}

const ShopByCategoryCard = ({
    href,
    name,
    description,
    image,
}: ShopByCategoryCardProps) => {
    return (
        <LocalizedClientLink href={href} className="block h-full">
            <Container className="h-full flex flex-col overflow-hidden p-0 cursor-pointer focus:shadow-borders-interactive-with-active">
                <div className="relative aspect-square w-full overflow-hidden">
                    {image?.url && (
                        <Image
                            src={image.url}
                            alt={image.alt || name}
                            width={0}
                            height={0}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="h-full w-full object-cover object-center transition-transform duration-300 ease-out hover:scale-105"
                        />
                    )}
                </div>
                <div className="flex justify-between gap-3 bg-ui-bg-subtle px-4 py-3 flex-1">
                    <div className="min-w-0">
                        <Heading level="h3" className="text-ui-fg-base truncate font-heading">
                            {name}
                        </Heading>
                        {description && (
                            <Text
                                size="small"
                                className="text-ui-fg-muted line-clamp-2 mt-1"
                            >
                                {description}
                            </Text>
                        )}
                    </div>
                    <ArrowRightMini className="shrink-0 text-ui-fg-muted self-center" />
                </div>
            </Container>
        </LocalizedClientLink>
    )
}

export default ShopByCategoryCard


