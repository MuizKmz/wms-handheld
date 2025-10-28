<template>
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="false" pageTitle="Notification"/>
  <div class="notification-container">
    <div v-if="notifications.length">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
      >
        <div class="notification-content">
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <button class="close-btn" @click="removeNotification(notification.id)">✖</button>
      </div>
    </div>
    <p v-else class="no-notifications">No notifications available</p>

    <button v-if="notifications.length" class="clear-btn" @click="clearAll">
      CLEAR ALL
    </button>
  </div>
</template>

<script>
import HeaderComponent from '@/views/components/Header.vue'

export default {
  components: {
    HeaderComponent,
  },
  data() {
    return {
      notifications: [
        {
          id: 1,
          title: 'Low Stock Alert!',
          message: 'The stock of Two-star stew is running low. Only 200 units left. Please restock to avoid inventory shortages.'
        },
        {
          id: 2,
          title: 'Notice',
          message: 'Broken Bird\'s Nest is currently out of stock. Please update your inventory or check for restocking options.'
        },
        {
          id: 3,
          title: 'Suggested reorder',
          message: 'The stock of Splicing Lamp (Large) is nearly gone with only 5 units remaining. Consider restocking.'
        }
      ]
    }
  },
  methods: {
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },
    clearAll() {
      this.notifications = []
    }
  }
}
</script>

<style scoped>
.notification-container {
  background: #2c2c2c;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-height: 100vh;
}

.notification-card {
  background: #aaa;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-content {
  text-align: left;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.clear-btn {
  background: #fbe5d6;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.no-notifications {
  color: white;
  font-size: 16px;
}
</style>
  