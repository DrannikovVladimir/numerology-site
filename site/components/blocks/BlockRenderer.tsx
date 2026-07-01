import Paragraph from "./Paragraph";
import H2 from "./H2";
import H3 from "./H3";
import Fact from "./Fact";
import Quote from "./Quote";
import Table from "./Table";
import List from "./List";
import Callout from "./Callout";
import FactRow from "./FactRow";
import Cta from "./Cta";
import Faq from "./Faq";
import Links from "./Links";
import Image from "./Image";

interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

interface H2BlockType {
  type: "h2";
  text: string;
  lead: string;
}

interface H3BlockType {
  type: "h3";
  text: string;
}

interface FactBlock {
  type: "fact";
  text: string;
}

interface QuoteBlock {
  type: "quote";
  text: string;
  source?: string;
}

interface TableBlock {
  type: "table";
  caption: string;
  headers: string[];
  rows: string[][];
}

interface ListBlock {
  type: "list";
  style: "ul" | "ol";
  items: string[];
}

interface CalloutBlock {
  type: "callout";
  variant: "info" | "tip" | "warning";
  text: string;
}

interface FactRowBlock {
  type: "fact_row";
  items: { label: string; value: string }[];
}

interface CtaBlock {
  type: "cta";
  text: string;
  url: string;
  position?: "after_intro" | "after_calculation" | "end_of_article";
}

interface FaqBlock {
  type: "faq";
  items: { question: string; answer: string }[];
}

interface LinksBlock {
  type: "links";
  title: string;
  items: { url: string; anchor: string; description: string }[];
}

interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export type Block =
  | ParagraphBlock
  | H2BlockType
  | H3BlockType
  | FactBlock
  | QuoteBlock
  | TableBlock
  | ListBlock
  | CalloutBlock
  | FactRowBlock
  | CtaBlock
  | FaqBlock
  | LinksBlock
  | ImageBlock;

interface BlockRendererProps {
  blocks: Block[];
}

// Сопоставляет каждый блок статьи с его компонентом по полю type
export default function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <Paragraph key={index} text={block.text} />;
          case "h2":
            return <H2 key={index} text={block.text} lead={block.lead} />;
          case "h3":
            return <H3 key={index} text={block.text} />;
          case "fact":
            return <Fact key={index} text={block.text} />;
          case "quote":
            return <Quote key={index} text={block.text} source={block.source} />;
          case "table":
            return (
              <Table
                key={index}
                caption={block.caption}
                headers={block.headers}
                rows={block.rows}
              />
            );
          case "list":
            return <List key={index} style={block.style} items={block.items} />;
          case "callout":
            return <Callout key={index} variant={block.variant} text={block.text} />;
          case "fact_row":
            return <FactRow key={index} items={block.items} />;
          case "cta":
            return <Cta key={index} text={block.text} url={block.url} position={block.position} />;
          case "faq":
            return <Faq key={index} items={block.items} />;
          case "links":
            return <Links key={index} title={block.title} items={block.items} />;
          case "image":
            return <Image key={index} src={block.src} alt={block.alt} caption={block.caption} />;
          default: {
            const unknownBlock = block as { type: string };
            console.warn(`BlockRenderer: неизвестный тип блока "${unknownBlock.type}"`);
            return null;
          }
        }
      })}
    </>
  );
}
