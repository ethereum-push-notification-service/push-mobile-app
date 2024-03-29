import notifee, {AndroidStyle} from '@notifee/react-native';
import MetaStorage from 'src/singletons/MetaStorage';

const getFormattedString = (msg: string) => msg.replace(/%/g, '\n');

interface NotificationData {
  icon: string;
  color: string;
  image: string;
  default_vibrate_timings: string;
  body: string;
  title: string;
}

interface NotificationPayload {
  data: NotificationData;
  from: string;
  messageId: string;
  sentTime: number;
  ttl: number;
}

const NotifeeDisplayNotification = async function (
  payload: NotificationPayload, // payload: NotificationPayload,
) {
  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: payload.data.title,
    body: getFormattedString(payload.data.body),
    android: {
      channelId,
      smallIcon: payload.data.icon,
      color: payload.data.color,
      pressAction: {
        id: 'default',
      },
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          name: payload.data.title,
          icon: payload.data.image,
        },
        messages: [
          {
            text: getFormattedString(payload.data.body),
            timestamp: payload.sentTime,
          },
        ],
      },
    },
    ios: {
      categoryId: 'notification',
      attachments: [
        {
          url: payload.data.image,
        },
      ],
    },
  });

  await incrementBadge();
};

const incrementBadge = async () => {
  const currBadge = await MetaStorage.instance.getNotifeeBadgeCount();
  await MetaStorage.instance.setNotifeeCount(parseInt(currBadge, 10) + 1);
  await notifee.setBadgeCount(parseInt(currBadge, 10) + 1);
};

const NotifeClearBadge = async () => {
  await MetaStorage.instance.setNotifeeCount(0);
  await notifee.setBadgeCount(0);
};

export {NotifeeDisplayNotification, NotifeClearBadge};
