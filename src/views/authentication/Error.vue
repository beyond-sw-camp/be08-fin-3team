<template>
    <div class="v-application">
        <div class="v-application__wrap d-flex justify-center align-center text-center" style="height: 100vh;">
            <div>
                <img src="@/assets/images/backgrounds/error2.svg" width="a500" alt="404" class="responsive-img" />
                <h1 class="text-h1 pt-3">Opps!!!</h1>
                <h4 class="text-h4 my-8">존재하지 않는 페이지입니다.</h4>
                <v-btn flat color="primary" class="mb-4" to="/">메인으로 돌아가기</v-btn>
            </div>
        </div>
    </div>
</template>

<style scoped>
.v-application__wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}

.responsive-img {
    max-width: 100%;
    height: auto;
}
</style>
