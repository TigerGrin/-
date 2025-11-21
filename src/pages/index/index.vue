<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left">
        <view class="logo">
          <text class="logo-text">朱</text>
        </view>
        <text class="system-title">科室排班系统</text>
      </view>
      
      <view class="navbar-center">
        <view class="nav-item" @click="navigateTo('department')">
          <text class="nav-icon">🏥</text>
          <text class="nav-text">科室管理</text>
        </view>
        <view class="nav-item" @click="navigateTo('schedule')">
          <text class="nav-icon">📅</text>
          <text class="nav-text">排班管理</text>
        </view>
      </view>
      
      <view class="navbar-right">
        <view class="user-info">
          <view class="user-avatar">
            <text class="avatar-text">管</text>
          </view>
          <view class="user-details">
            <text class="user-name">管理员</text>
            <text class="user-role">系统管理员</text>
          </view>
        </view>
        <view class="logout-btn" @click="logout">
          <text class="logout-icon">→</text>
          <text class="logout-text">退出登录</text>
        </view>
      </view>
    </view>

    <!-- 英雄区域 -->
    <view class="hero-section">
      <text class="hero-title">科室排班系统</text>
      <text class="hero-subtitle">优化科室资源配置</text>
      <view class="hero-info">
        <text class="info-icon">🕐</text>
        <text class="info-text">实时同步·智能排班·数据分析</text>
      </view>
    </view>

    <!-- 统计卡片区域 -->
    <view class="stats-section">
      <view class="stat-card" :class="'stat-' + index" v-for="(stat, index) in stats" :key="index" @click="handleStatClick(stat)">
        <view class="stat-icon">{{ stat.icon }}</view>
        <text class="stat-title">{{ stat.title }}</text>
        <text class="stat-value">{{ stat.value }}</text>
        <view class="stat-progress" :class="'progress-' + index"></view>
      </view>
    </view>

    <!-- 系统功能区域 -->
    <view class="functions-section">
      <text class="section-title">系统功能</text>
      <view class="functions-grid">
        <view class="function-card" v-for="(func, index) in functions" :key="index" @click="navigateTo(func.route)">
          <view class="function-icon">{{ func.icon }}</view>
          <text class="function-title">{{ func.title }}</text>
          <text class="function-desc">{{ func.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDepartmentStatistics } from '@/api/statistics'
import { getDepartmentList } from '@/api/department'

export default {
  data() {
    return {
      stats: [
        {
          icon: '🏥',
          title: '科室人数',
          value: '0',
          color: 'purple'
        },
        {
          icon: '🕐',
          title: '本周排班',
          value: '0',
          color: 'orange'
        }
      ],
      functions: [
        
        {
          icon: '🏥',
          title: '科室管理',
          description: '管理科室信息和容量',
          route: 'department'
        },
        {
          icon: '📅',
          title: '排班管理',
          description: '管理排班计划和时间表',
          route: 'schedule'
        }
      ]
    }
  },
  onLoad() {
    console.log('科室排班系统首页加载完成')
    this.loadStatistics()
  },
  methods: {
    // 加载统计数据（带重试机制）
    async loadStatistics(retryCount = 0) {
      const maxRetries = 2 // 最多重试2次
      
      try {
        // 获取科室统计信息（默认科室D001）
        const result = await getDepartmentStatistics({ departmentId: 'D001' })
        if (result) {
          // 更新统计卡片数据
          this.stats[0].value = String(result.totalNurses || 0)
          this.stats[1].value = String(result.weeklyShifts || 0)
          console.log('✅ 统计数据加载成功:', result)
        }
      } catch (error) {
        console.error(`加载统计数据失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error)
        
        // 如果是网关错误且还有重试次数，则重试
        if ((error.message && (error.message.includes('502') || error.message.includes('Bad Gateway'))) && retryCount < maxRetries) {
          console.log(`⏳ ${retryCount + 1} 秒后重试加载统计数据...`)
          setTimeout(() => {
            this.loadStatistics(retryCount + 1)
          }, (retryCount + 1) * 1000) // 递增延迟：1秒、2秒
          return
        }
        
        // 根据错误类型提供不同的处理
        if (error.message && (error.message.includes('502') || error.message.includes('Bad Gateway'))) {
          console.warn('⚠️ 后端网关错误，统计数据将显示为默认值。这可能是临时问题。')
        } else if (error.message && error.message.includes('503')) {
          console.warn('⚠️ 后端服务不可用，统计数据将显示为默认值。请确认后端服务已启动。')
        } else {
          console.warn('⚠️ 统计数据加载失败，使用默认值。错误:', error.message)
        }
        
        // 设置默认值，确保界面正常显示
        this.stats[0].value = '0'
        this.stats[1].value = '0'
      }
    },
    navigateTo(route) {
      console.log('导航到:', route)
      
      // 根据路由跳转到对应页面
      switch(route) {
        case 'department':
          console.log('准备跳转到科室管理页面')
          // 尝试多种路径格式
          uni.navigateTo({
            url: '/pages/department/department',
            success: function(res) {
              console.log('跳转成功:', res)
            },
            fail: function(err) {
              console.error('跳转失败:', err)
              // 如果navigateTo失败，尝试使用reLaunch
              uni.reLaunch({
                url: '/pages/department/department',
                success: function(res) {
                  console.log('reLaunch跳转成功:', res)
                },
                fail: function(err2) {
                  console.error('reLaunch也失败:', err2)
                  uni.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                    duration: 3000
                  })
                }
              })
            }
          })
          break
        case 'schedule':
          console.log('准备跳转到排班管理页面')
          uni.navigateTo({
            url: '/pages/schedule/schedule',
            success: function(res) {
              console.log('跳转成功:', res)
            },
            fail: function(err) {
              console.error('跳转失败:', err)
              uni.reLaunch({
                url: '/pages/schedule/schedule',
                success: function(res) {
                  console.log('reLaunch跳转成功:', res)
                },
                fail: function(err2) {
                  console.error('reLaunch也失败:', err2)
                  uni.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                    duration: 3000
                  })
                }
              })
            }
          })
          break
        default:
          uni.showToast({
            title: `即将跳转到${route}页面`,
            icon: 'none'
          })
      }
    },
    handleStatClick(stat) {
      console.log('点击统计卡片:', stat.title)
      uni.showToast({
        title: `查看${stat.title}详情`,
        icon: 'none'
      })
    },
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.logo {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

.system-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.navbar-center {
  display: flex;
  gap: 40rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.nav-item:active {
  background-color: #f0f0f0;
  transform: scale(0.95);
}

.nav-icon {
  font-size: 24rpx;
}

.nav-text {
  font-size: 24rpx;
  color: #666666;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.user-role {
  font-size: 22rpx;
  color: #666666;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: #ef4444;
  border-radius: 20rpx;
  transition: all 0.3s ease;
}

.logout-btn:active {
  background-color: #dc2626;
  transform: scale(0.95);
}

.logout-icon {
  color: #ffffff;
  font-size: 20rpx;
}

.logout-text {
  color: #ffffff;
  font-size: 24rpx;
}

/* 英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 40rpx;
  text-align: center;
  color: #ffffff;
}

.hero-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.hero-subtitle {
  font-size: 28rpx;
  margin-bottom: 30rpx;
  opacity: 0.9;
  display: block;
}

.hero-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.info-icon {
  font-size: 24rpx;
}

.info-text {
  font-size: 24rpx;
  opacity: 0.8;
}

/* 统计卡片区域 */
.stats-section {
  display: flex;
  gap: 20rpx;
  padding: 40rpx;
  overflow-x: auto;
}

.stat-card {
  flex: 1;
  min-width: 200rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 16rpx;
}

.stat-title {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.stat-progress {
  height: 6rpx;
  border-radius: 3rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.progress-0 { background-color: #3b82f6; }
.progress-1 { background-color: #10b981; }
.progress-2 { background-color: #8b5cf6; }
.progress-3 { background-color: #f59e0b; }

/* 系统功能区域 */
.functions-section {
  padding: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
  display: block;
}

.functions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
  gap: 20rpx;
}

.function-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.function-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
}

.function-icon {
  font-size: 48rpx;
  margin-bottom: 20rpx;
}

.function-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.function-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
  display: block;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .navbar-center {
    gap: 20rpx;
  }
  
  .nav-item {
    padding: 8rpx 12rpx;
  }
  
  .nav-text {
    font-size: 20rpx;
  }
  
  .hero-title {
    font-size: 40rpx;
  }
  
  .hero-subtitle {
    font-size: 24rpx;
  }
  
  .stats-section {
    padding: 20rpx;
    gap: 12rpx;
  }
  
  .stat-card {
    min-width: 160rpx;
    padding: 20rpx 12rpx;
  }
  
  .functions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
