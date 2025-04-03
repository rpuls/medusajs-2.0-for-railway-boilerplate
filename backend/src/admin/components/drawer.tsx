import { Button, Drawer } from "@medusajs/ui";

type DrawerComponentProps = {
  title: string;
  content: any
};

export default function DrawerComponent({
  title,
  content,
}: DrawerComponentProps) {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>{title}</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{title}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">{content}</Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
