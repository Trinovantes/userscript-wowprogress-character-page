<template>
    <div class="loader">
        Loading
    </div>
</template>

<style lang="scss" scoped>
.loader {
    border-radius: 50%;
    width: 4em;
    height: 4em;

    border: 1em solid rgba(white, 0.2);
    border-left-color: white;
    margin: $padding auto;
    text-indent: -9999em;

    transform: translateZ(0);
    animation: load8 1.5s infinite linear;
}

@-webkit-keyframes load8 {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
@keyframes load8 {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
