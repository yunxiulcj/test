<template>
  <div class="loginPage">
    <div class="pageTop"></div>
    <div class="pageMiddle">
      <div class="imgContent"></div>
      <div class="formWrap">
        <div class="projectName">{{ projectName }}</div>
        <el-form
          label-position="top"
          style="width: 320px"
          :model="formObj"
          :rules="formRules"
          ref="loginForm"
        >
          <el-form-item label="账号" prop="account">
            <el-input
              v-model="formObj.account"
              @on-enter="handleLogin(formObj)"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formObj.password"
              :type="inputType"
              @on-enter="handleLogin(formObj)"
              ><i slot="suffix" :class="inputIcon" @click="changeType"></i
            ></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="captchaCode">
            <el-input
              v-model="formObj.captchaCode"
              style="width: 150px"
              @keyup.enter.native="handleLogin(formObj)"
            >
            </el-input>
            <span class="imgWrap">
              <span class="imgBox">
                <img :src="srcUrl" width="85px">
              </span>
              <i class="el-icon-refresh" @click="handleRefreshVerify"></i>
            </span>
          </el-form-item>
        </el-form>
        <div class="passwordOp">
          <el-checkbox
            v-model="KeepPassword"
            label="记住密码"
          ></el-checkbox>
          <span>忘记密码？</span>
        </div>
        <el-button
          @click="handleLogin(formObj)"
          style="width: 320px; margin-top: 20px"
          type="primary"
          :loading="loginLoading"
          >登 录</el-button
        >
      </div>
    </div>
    <div class="pageFooter"></div>
  </div>
</template>

<script>
export default {
  name: 'loginPage',
  data() {
    return {
      srcUrl:'',
      loginLoading:false,
      refleshLoading: false,
      KeepPassword: false,
      projectName: '',
      inputType: 'password',
      inputIcon: 'iconfont icon-show',
      formObj: {
        account: '',
        password: '',
        captchaCode: '',
      },
      formRules: {
        account: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
        ],
        captchaCode: [
          { required: true, message: '验证码不能为空', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.projectName=this.$store.getters.symSetting.projectName
    this.$set(this.formObj,'password',JSON.parse(localStorage.getItem('keepPwd'))?localStorage.getItem('pwd'):'')
  },
  mounted() {
    this.formObj.account=localStorage.getItem('account') || ''
    this.$set(this.formObj,'password',JSON.parse(localStorage.getItem('keepPwd'))?localStorage.getItem('pwd'):'')
    this.KeepPassword=JSON.parse(localStorage.getItem('keepPwd'))?true:false
    this.handleRefreshVerify()
  },
  methods: {
    handleLogin(data) {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loginLoading=true
          this.$http('Login',data).then(()=>{
            if(this.KeepPassword){
              localStorage.setItem('keepPwd',true)
              localStorage.setItem('pwd',data.password)
            }else{
              localStorage.setItem('keepPwd',false)
              localStorage.setItem('pwd','')
            }
            localStorage.setItem('account',data.account)
            this.$router.push('/')
          },()=>{
            this.handleRefreshVerify()
          }).finally(()=>{
            this.loginLoading=false
          })
        }
      })
    },
    changeType() {
      if (this.inputType == 'password') {
        this.inputType = 'text'
        this.inputIcon = 'iconfont icon-hidden'
      } else {
        this.inputType = 'password'
        this.inputIcon = 'iconfont icon-show'
      }
    },
    handleRefreshVerify() {
      let baseUrl=process.env.NODE_ENV === 'production' ? this.$store.getters.symSetting.host : '/api'
      this.srcUrl=baseUrl+"/Login/GetCaptchaCode?"+Math.random()
    },
  },
}
</script>

<style lang="scss" scoped>
.loginPage {
  height: 100%;
  min-width: 1300px;
  .pageTop {
    height: 50px;
    background: white;
  }
  .pageMiddle {
    position: relative;
    height: 546px;
    background: #373b44;
    background: -webkit-linear-gradient(to bottom, #56ccf2, #2f80ed);
    background: linear-gradient(to bottom, #56ccf2, #2f80ed);
    .imgContent {
      width: 511px;
      height: 490px;
      background: url('../../assets/img/pic.png');
      background-repeat: no-repeat;
      position: absolute;
      top: 80px;
      right: 50%;
    }
    .formWrap {
      position: absolute;
      background: white;
      border: 1px solid #adb5bd;
      border-radius: 5px;
      padding: 20px;
      right: 15%;
      top: 80px;
      .projectName {
        text-align: center;
        color: #228be6;
        font-weight: 600;
        font-size: 18px;
        letter-spacing: 8px;
      }
      .passwordOp {
        span {
          float: right;
          font-size: 14px;
          cursor: pointer;
          color: #495057;
        }
        span:hover {
          color: #228be6;
        }
      }
    }
  }
  .pageFooter {
    background: white;
  }
}
.imgWrap {
  position: relative;
  float:right;
  margin-right: 45px;
  .imgBox {
    display: inline-block;
    width: 85px;
    height: 40px;
    margin: 0 15px;
  }
  i {
    position: absolute;
    top: 6px;
  }
  i:active {
    animation: 0.6s rotatefresh 1;
  }
  @keyframes rotatefresh {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
      transition-duration: 0.6s;
      transition: 0.6s;
    }
  }
}
.el-icon-refresh {
  font-size: 25px;
  color: #868e96;
  cursor: pointer;
}
.iconfont {
  font-size: 22px;
  cursor: pointer;
}
.iconfont:hover {
  color: #495057;
}
</style>
