<template>
    <div>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Badminton Shop - Your one-stop shop for all badminton equipment">
        <meta name="keywords" content="badminton, racket, shuttlecock, sports equipment">
        <title>{{ title }} - Badminton Shop</title>
        <link rel="icon" type="image/x-icon" href="/src/assets/img/favicon.ico">

        <!--<link rel="apple-touch-icon" href="/src/assets/img/apple-icon.png">-->
        <!--<link rel="shortcut icon" type="image/x-icon" href="/src/assets/img/favicon.ico">-->

        <link rel="stylesheet" href="/src/assets/css/bootstrap.min.css">
        <link rel="stylesheet" href="/src/assets/css/templatemo.css">
        <link rel="stylesheet" href="/src/assets/css/custom.css">

        <!-- Load fonts style after rendering the layout styles -->
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;700;900&display=swap">
        <link rel="stylesheet" href="/src/assets/css/fontawesome.min.css">


        <!-- Load map styles -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossorigin="" />

        <!-- Slick -->
        <link rel="stylesheet" type="text/css" href="/src/assets/css/slick.min.css">
        <link rel="stylesheet" type="text/css" href="/src/assets/css/slick-theme.css">
    </div>

</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: 'Home'
        }
    }
}
</script>
<style></style>