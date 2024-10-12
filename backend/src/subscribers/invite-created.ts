import { INotificationModuleService, IUserModuleService } from '@medusajs/types';
import { ModuleRegistrationName, Modules } from '@medusajs/utils';
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import { backendUrl } from '../../medusa-config';

export default async function userInviteHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  // console.log('User invite created', data);

  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);
  const userModuleService: IUserModuleService = container.resolve(Modules.USER);

  const invite = await userModuleService.retrieveInvite(data.id);

  // SendGrid code 
  // const { email, token } = invite;
  // await notificationModuleService.createNotifications({
  //   to: email,
  //   channel: 'email',
  //   template: process.env.SENDGRID_TEMPLATE_ID_USER_IVITE_CREATED, 
  //   data: { invite_link: `${backendUrl}/app/invite?token=${token}` }
  // });

  // Resend code
  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: `<strong>Your invite link:</strong> <a href="${backendUrl}/app/invite?token=${invite.token}">Click here</a>`, 
      data: { 
        subject: 'You have been invited!'
      }
    });
    console.log('Resend notification sent successfully.');
  } catch (error) {
  }
}

export const config: SubscriberConfig = {
  event: 'invite.created'
};
