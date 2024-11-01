# Email templates

This directory contains all the email templates used in the application using `react-email`.

Run the following command to start the development server:

```bash
pnpm email:dev
```

This will start a react-email server at `http://localhost:3002` where you can preview the email templates.


## Usage

### Trigger an email notification

To send a notification using an email template, specify the template key and required data when calling `createNotifications`:

```typescript
await notificationModuleService.createNotifications({
  to: invite.email,
  channel: 'email',
  template: EmailTemplates.INVITE_USER, // Use the enum for the template key
  data: {
    emailOptions: {
      replyTo: 'info@example.com',
      subject: "You've been invited!",
    },
    inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
    preview: 'Get started with your invitation...',
  },
})
```

### Adding a new template

To add a new email template:

#### 1. Create the template component

Add a new file in the templates directory, following the `react-email` component style. For example, `new-template.tsx`:

```tsx
import { Html, Body, Container, Text, Preview } from '@react-email/components'
import * as React from 'react'

export const NEW_TEMPLATE_KEY = 'new-template'

export interface NewTemplateProps {
  greeting: string
  actionUrl: string
  preview?: string
}

export const isNewTemplateData = (data: any): data is NewTemplateProps =>
  typeof data.greeting === 'string' && typeof data.actionUrl === 'string'

export const NewTemplate = ({ greeting, actionUrl, preview = 'You have a new message' }: NewTemplateProps) => (
  <Html>
    <Preview>{preview}</Preview>
    <Body>
      <Container>
        <Text>{greeting}</Text>
        <Text>Click <a href={actionUrl}>here</a> to take action.</Text>
      </Container>
    </Body>
  </Html>
)
```

#### 2. Add the new template key to the `EmailTemplates` enum:

```typescript
import { NEW_TEMPLATE_KEY } from './new-template'

export enum EmailTemplates {
  // ...
  NEW_TEMPLATE = NEW_TEMPLATE_KEY, // Add new key here
}
```

#### 3. Add template handling to `generateEmailTemplate`
Update the `generateEmailTemplate` function to handle the new template:

```tsx
import NewTemplate, { NEW_TEMPLATE_KEY, isNewTemplateData } from './new-template'

export enum EmailTemplates {
  // ...
  NEW_TEMPLATE = NEW_TEMPLATE_KEY,
}

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    // ...
    case EmailTemplates.NEW_TEMPLATE:
      if (!isNewTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.NEW_TEMPLATE}"`
        )
      }
      return (<NewTemplate {...data} />)
    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`,
      )
  }
}
```

#### 4. Trigger the new template in a subscriber
Finally, call `createNotifications` with the new template key and data

```typescript
await notificationModuleService.createNotifications({
  to: user.email,
  channel: 'email',
  template: EmailTemplates.NEW_TEMPLATE, // or 'new-template'
  data: {
    emailOptions: {
      subject: 'Action Required',
      replyTo: 'support@example.com',
    },
    greeting: 'Hello there!',
    actionUrl: `${BACKEND_URL}/take-action?token=${user.token}`,
    preview: 'An important action is awaiting you...',
  },
})
```

## Additional Info & Documentation

I based this module off of [@typed-dev/medusa-notification-resend](https://github.com/typed-development/medusa-notification-resend) but added
the ability to use `react-email` templates and extended the functionality to include more Resend options. 

In the original module, you're limited to just `subject`, `from`, `to`, the body, and the attachments. You also could
only send HTML, which means you have to render the email body using `@react-email/render` instead of using the
`react` email option which renders it for you.

### Medusa

* Guide: [How to Create a Notification Provider Module](https://docs.medusajs.com/resources/references/notification-provider-module)
* Getting Started: [Events & Subscribers](https://docs.medusajs.com/learn/basics/events-and-subscribers) 

### React Email

For more information on how to use `react-email`, refer to the official [documentation](https://react.email/)

You can also use [these example templates](https://demo.react.email/preview/magic-links/aws-verify-email) as a reference.

### Resend

* Docs: [Node.js Quickstart](https://resend.com/docs/send-with-nodejs)
