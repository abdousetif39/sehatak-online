import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

# Replace the stats calculation block
old_stats = """      const stats: Record<string, { read: number, replied: number, delivered: number, recipients: any[] }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (!stats[data.broadcastId]) {
          stats[data.broadcastId] = { read: 0, replied: 0, delivered: 0, recipients: [] };
        }
        if (data.readAt) stats[data.broadcastId].read++;
        if (data.repliedAt) stats[data.broadcastId].replied++;
        if (data.deliveredAt) stats[data.broadcastId].delivered++;
        stats[data.broadcastId].recipients.push({"""

new_stats = """      const stats: Record<string, { read: number, replied: number, delivered: number, sentOnly: number, unread: number, recipients: any[] }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (!stats[data.broadcastId]) {
          stats[data.broadcastId] = { read: 0, replied: 0, delivered: 0, sentOnly: 0, unread: 0, recipients: [] };
        }
        if (data.readAt) {
          stats[data.broadcastId].read++;
        } else if (data.deliveredAt) {
          stats[data.broadcastId].delivered++;
          stats[data.broadcastId].unread++;
        } else {
          stats[data.broadcastId].sentOnly++;
          stats[data.broadcastId].unread++;
        }
        if (data.repliedAt) stats[data.broadcastId].replied++;
        stats[data.broadcastId].recipients.push({"""

content = content.replace(old_stats, new_stats)

# Also update the type in the useState for broadcastStats
content = content.replace(
    'useState<Record<string, { read: number, replied: number, delivered: number, recipients: any[] }>>',
    'useState<Record<string, { read: number, replied: number, delivered: number, sentOnly: number, unread: number, recipients: any[] }>>'
)

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
