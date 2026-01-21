import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps } from "@medusajs/framework/types";
import { Container, Heading, Text } from "@medusajs/ui";
import { PencilSquare } from "@medusajs/icons";
import useSWR from "swr";
import { useSearchParams } from "react-router-dom";

import { sdk } from "../lib/sdk";
import { ActionMenu } from "../routes/branding/common/action-menu";
import { EditCategoryImageDrawer } from "./edit-category-image-drawer";

type CategoryImage = {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
};

type AdminProductCategory = {
    id: string;
    name: string;
    metadata?: {
        image?: CategoryImage;
    };
};

const categoryFetcher = async (categoryId: string) => {
    return await sdk.admin.productCategory.retrieve(categoryId, {
        fields: "+metadata",
    });
};

const CategoryImageWidget = ({
    data: category,
}: DetailWidgetProps<AdminProductCategory>) => {
    const [searchParams] = useSearchParams();

    // Fetch category with metadata
    const { data: queryResult, isLoading } = useSWR(
        [`category`, category.id],
        () => categoryFetcher(category.id)
    );

    const categoryData =
        (queryResult?.product_category as AdminProductCategory) || category;
    const imageData = categoryData?.metadata?.image as CategoryImage | undefined;

    if (isLoading) {
        return (
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex flex-col">
                        <div className="bg-ui-bg-component h-4 w-32 animate-pulse rounded" />
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <>
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <Heading level="h2">Category Image</Heading>
                        <Text className="text-ui-fg-subtle" size="small">
                            Upload an image for this category
                        </Text>
                    </div>
                    <ActionMenu
                        groups={[
                            {
                                actions: [
                                    {
                                        icon: <PencilSquare />,
                                        label: "Edit",
                                        to: `?edit=category-image`,
                                    },
                                ],
                            },
                        ]}
                    />
                </div>
                <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
                    <Text size="small" leading="compact" weight="plus">
                        Image
                    </Text>
                    {imageData?.url ? (
                        <div className="flex items-center gap-x-3">
                            <div className="bg-ui-bg-component flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
                                <img
                                    src={imageData.url}
                                    alt={imageData.alt || "Category image"}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Text size="small" leading="compact">
                                    {imageData.width}x{imageData.height}px
                                </Text>
                                <Text size="xsmall" leading="compact" className="text-ui-fg-muted">
                                    {imageData.alt || "-"}
                                </Text>
                            </div>
                        </div>
                    ) : (
                        <Text size="small" leading="compact">
                            -
                        </Text>
                    )}
                </div>
            </Container>
            {searchParams.get("edit") === "category-image" && (
                <EditCategoryImageDrawer categoryId={category.id} />
            )}
        </>
    );
};

export const config = defineWidgetConfig({
    zone: "product_category.details.side.before",
});

export default CategoryImageWidget;
