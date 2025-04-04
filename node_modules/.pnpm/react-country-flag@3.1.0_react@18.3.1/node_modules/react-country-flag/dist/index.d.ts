import * as React from 'react';
interface EmojiProps extends React.HTMLAttributes<HTMLSpanElement> {
    cdnSuffix?: string;
    cdnUrl?: string;
    countryCode: string;
    style?: React.CSSProperties;
    svg?: false;
}
interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    cdnSuffix?: string;
    cdnUrl?: string;
    countryCode: string;
    style?: React.CSSProperties;
    svg?: true;
}
export declare type ReactCountryFlagProps = EmojiProps | ImgProps;
export declare const ReactCountryFlag: ({ cdnSuffix, cdnUrl, countryCode, style, svg, ...props }: ReactCountryFlagProps) => JSX.Element | null;
export default ReactCountryFlag;
