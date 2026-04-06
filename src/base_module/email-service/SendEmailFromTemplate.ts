import { Logger } from "@nestjs/common";
import Mail from 'nodemailer/lib/mailer';
import * as Email from 'email-templates';
import { mailTransport } from "./MailTransport";
import * as path from 'path';



const logger = new Logger('SendEmailFromTemplate');
interface EmailPayload {
    template: string;
    to?: string | string[];
    sender_name?: string;
    locals?: object;
    attachments?: Mail.Attachment[];
    bcc?: string | string[];
    replyTo?: string;
    cc?: string | string[] | undefined;
}


export const SendEmailFromTemplate = async ({
    template,
    to,
    locals,
    sender_name = 'safiu waheed', //'uimssn library',
    attachments = [],
    bcc,
    replyTo,
    cc,
}: EmailPayload) => {
    const email = new Email({
        message: {
            from: `${sender_name} <${process.env.APP_MAILER_USER}>`,
            bcc,
            cc,
            replyTo,
        },
        send: true,
        transport: mailTransport,
        juice: true,
        views: {
            root: path.join(process.cwd(), 'src/templates/emails'),
        },
        juiceResources: {
            preserveFontFaces: true,
            preserveImportant: true,
            webResources: {
                relativeTo: path.join(process.cwd(), 'src/templates/emails/assets'),
            },
        },
    });

    try {
        const response = await email.send({
            template,
            message: {
                to,
                attachments,
            },
            locals,
        });

        return response;
    } catch (e) {
        logger.log('Unable to send email', e);
    } finally {
        // Slack notification with rendered email content
        // await sendRenderedEmailToSlack(template, locals);
    }
};