<!--
 * @LastEditors: v-bianjunping
 * @LastEditTime: 2024-03-25 16:29:19
-->
<template>
  <div class="anchor-link-item" :class="cls" @click="handeClick">
    <a ref="linkRef" :href="href">
      <slot></slot>
    </a>
  </div>
</template>

<script>
export default {
  name: "AnchorLink",
  props: {
    href: {
      type: String,
      default: "",
    },
  },
  inject: {
    currentAnchor: "currentAnchor",
    addLink: "addLink",
    removeLink: "removeLink",
    contextHandleClick: "handleClick",
  },
  computed: {
    cls() {
      const _href = this.currentAnchor();
      if (_href === this.href) {
        return ["is-active"];
      }
      return "";
    },
  },
  watch: {
    href(val, oldVal) {
      this.$nextTick(() => {
        if (oldVal) {
          this.removeLink(oldVal);
        }
        if (val) {
          this.addLink({
            href: val,
            el: this.$refs.linkRef,
          });
        }
      });
    },
  },
  mounted() {
    if (this.href) {
      this.addLink({
        href: this.href,
        el: this.$refs.linkRef,
      });
    }
  },
  unmounted() {
    if (this.href) {
      this.removeLink(this.href);
    }
  },
  methods: {
    handeClick(e) {
      this.contextHandleClick(e, this.href);
    },
  },
};
</script>

<style lang="scss">
.anchor-link-item {
  flex: auto;
  // border-right: 1px solid #979797;
  overflow: hidden;
  text-align: center;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 6px;
    display: block;
    width: 0;
    height: 12px;
    border-right: 1px solid #979797;
  }
  &:last-child::after {
    border-right: none;
  }
  &.is-active a {
    color: #00bd76;
  }
  a {
    display: inline-block;
    width: 70px;
    height: 21px;
    font-weight: 500;
    font-size: 15px;
    color: rgba(0, 0, 0, 0.9);
    line-height: 21px;
    text-align: center;
    font-style: normal;
    transition: color 0.3s;
    white-space: nowrap;
    text-decoration: none;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;
    outline: none;
    cursor: pointer;
  }
}
</style>
