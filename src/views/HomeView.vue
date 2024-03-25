<template>
  <div>
    <AffixBox :offset="70">
      <AnchorBox :offset="130">
        <AnchorLink href="#base">基本信息</AnchorLink>
        <AnchorLink href="#product">产品信息</AnchorLink>
      </AnchorBox>
    </AffixBox>
    <div class="soll-content">
      <div id="base">这是一段文字</div>
      <div id="product">这是一段文字</div>
    </div>
  </div>
</template>

<script>
import AffixBox from "@/components/AffixBox.vue";
import AnchorBox from "@/components/AnchorBox.vue";
import AnchorLink from "@/components/AnchorLink.vue";
export default {
  name: "HomeView",
  components: { AffixBox, AnchorBox, AnchorLink },
};
</script>
<style>
#product,
#base {
  height: 600px;
  border: 1px solid red;
  margin-bottom: 20px;
  padding: 20px;
  text-align: center;
  font-size: 15px;
}
</style>
