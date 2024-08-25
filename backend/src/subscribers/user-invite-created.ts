import { INotificationModuleService } from '@medusajs/types';
import { ModuleRegistrationName } from '@medusajs/utils';
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import { backendUrl } from '../../medusa-config';


export default async function userInviteHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {


  console.log('User invite created', data);
  //  Note: invite does not contain email and token yet 
  // const { email, token } = invite;
  
  // const notificationModuleService: INotificationModuleService = container.resolve(ModuleRegistrationName.NOTIFICATION);
  // await notificationModuleService.createNotifications({
  //   to: email,
  //   channel: 'email',
  //   template: process.env.SENDGRID_TEMPLATE_ID_USER_IVITE_CREATED, // Replace with your SendGrid template ID
  //   data: { invite_link: `${backendUrl}/app/invite?token=${token}` }
  // });
}

export const config: SubscriberConfig = {
  event: 'user.invite.created'
};
