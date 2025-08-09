export const getSubscriptionManager = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manager = require("@/services/subscriptions/subscriptionManager").default;
    return manager;
  } catch (error) {
    console.warn("SubscriptionManager not available, using fallback");
    return {
      subscribeToNotifications: (userId: string, callback: () => void) => {
        console.log("Fallback: Would subscribe to notifications for", userId);
        return () => {};
      },
    } as any;
  }
};

export default getSubscriptionManager;
