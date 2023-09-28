async function register({
    registerSetting,
    settingsManager,
    transcodingManager,
    peertubeHelpers,
}) {
    const { logger } = peertubeHelpers

    const vod_default_crf = 20
    const vod_default_preset = "slow"
    const vod_default_tune = null
    const vod_default_profile = "high"
    const live_default_crf = 21
    const live_default_preset = "fast"
    const live_default_tune = "zerolatency"
    const live_default_profile = "high"

    const setting_crf_description =
    "Set the quality for the encode. Lower values mean better quality, but larger file sizes. The default is 23, and sane values are between 18 and 28. The range is logarithmic, so increasing the CRF by 6 roughly doubles the file size, while decreasing it by 6 roughly halves the file size. Available values are 0-51."
    const setting_preset_description =
    "Set the preset to be used when encoding. A slower preset will provide better compression (compression is quality per filesize). This means that, for example, if you target a certain file size or constant bit rate, you will achieve better quality with a slower preset. Similarly, for constant quality encoding, you will simply save bitrate by choosing a slower preset."
    const setting_tune_description =
    "Tune the settings for a particular type of source or situation. If you are unsure, leave this as None."
    const setting_profile_description =
    "Set the profile to be used when encoding. Note that some profiles are not supported by some codecs, and not all devices support all profiles. If you are unsure, leave this as None."

    const setting_preset_options = [
        { label: "Ultra Fast", value: "ultrafast" },
        { label: "Super Fast", value: "superfast" },
        { label: "Very Fast", value: "veryfast" },
        { label: "Faster", value: "faster" },
        { label: "Fast", value: "fast" },
        { label: "Medium", value: "medium" },
        { label: "Slow", value: "slow" },
        { label: "Slower", value: "slower" },
        { label: "Very Slow", value: "veryslow" },
    ]
    const setting_tune_options = [
        { label: "None", value: null },
        { label: "Film", value: "film" },
        { label: "Animation", value: "animation" },
        { label: "Grain", value: "grain" },
        { label: "Still Image", value: "stillimage" },
        { label: "Fast Decode", value: "fastdecode" },
        { label: "Zero Latency", value: "zerolatency" },
    ]
    const setting_profile_options = [
        { label: "None", value: null },
        { label: "Baseline", value: "baseline" },
        { label: "Main", value: "main" },
        { label: "High", value: "high" },
        { label: "High 10", value: "high10" },
        { label: "High 4:2:2", value: "high422" },
        { label: "High 4:4:4", value: "high444" },
    ]

    const store = {
        vod_crf: await settingsManager.getSetting("vod_crf") || vod_default_crf,
        vod_preset: await settingsManager.getSetting("vod_preset") || vod_default_preset,
        vod_tune: await settingsManager.getSetting("vod_tune") || vod_default_tune,
        vod_profile: await settingsManager.getSetting("vod_profile") || vod_default_profile,
        live_crf: await settingsManager.getSetting("live_crf") || live_default_crf,
        live_preset: await settingsManager.getSetting("live_preset") || live_default_preset,
        live_tune: await settingsManager.getSetting("live_tune") || live_default_tune,
        live_profile: await settingsManager.getSetting("live_profile") || live_default_profile,
    }
    settingsManager.onSettingsChange((settings) => {
        store.vod_crf = settings["vod_crf"]
        store.vod_preset = settings["vod_preset"]
        store.vod_tune = settings["vod_tune"]
        store.vod_profile = settings["vod_profile"]
        store.live_crf = settings["live_crf"]
        store.live_preset = settings["live_preset"]
        store.live_tune = settings["live_tune"]
        store.live_profile = settings["live_profile"]
    })

    registerSetting({
        name: "vod_crf",
        label: "[VOD] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: setting_crf_description,
        private: true,
        default: vod_default_crf,
    })
    registerSetting({
        name: "vod_preset",
        label: "[VOD] Preset",
        type: "select",
        options: setting_preset_options,
        descriptionHTML: setting_preset_description,
        private: true,
        default: vod_default_preset,
    })
    registerSetting({
        name: "vod_tune",
        label: "[VOD] Tune",
        type: "select",
        options: setting_tune_options,
        descriptionHTML: setting_tune_description,
        private: true,
        default: vod_default_tune,
    })
    registerSetting({
        name: "vod_profile",
        label: "[VOD] Profile",
        type: "select",
        options: setting_profile_options,
        descriptionHTML: setting_profile_description,
        private: true,
        default: vod_default_profile,
    })

    registerSetting({
        name: "live_crf",
        label: "[LIVE] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: setting_crf_description,
        private: true,
        default: live_default_crf,
    })
    registerSetting({
        name: "live_preset",
        label: "[LIVE] Preset",
        type: "select",
        options: setting_preset_options,
        descriptionHTML: setting_preset_description,
        private: true,
        default: live_default_preset,
    })
    registerSetting({
        name: "live_tune",
        label: "[LIVE] Tune",
        type: "select",
        options: setting_tune_options,
        descriptionHTML: setting_tune_description,
        private: true,
        default: live_default_tune,
    })
    registerSetting({
        name: "live_profile",
        label: "[LIVE] Profile",
        type: "select",
        options: setting_profile_options,
        descriptionHTML: setting_profile_description,
        private: true,
        default: live_default_profile,
    })

    function buildCRF(settingName, options) {
        return `${buildStreamSuffix("-crf:v", options.streamNum)} ${store[settingName]}`
    }

    function buildPreset(settingName, options) {
        return `${buildStreamSuffix("-preset:v", options.streamNum)} ${store[settingName]}`
    }

    function buildTune(settingName, options) {
        return store[settingName] ? `${buildStreamSuffix("-tune:v", options.streamNum)} ${store[settingName]}` : ""
    }

    function buildProfile(settingName, options) {
        const profile = store[settingName]
        if (profile) {
            const outputOptions = [`${buildStreamSuffix("-profile:v", options.streamNum)} ${profile}`]
            switch (profile) {
            case "high10":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv420p10le`)
                break
            case "high422":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv422p`)
                break
            case "high444":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv444p`)
                break
            }
            return outputOptions.join(" ")
        } else {
            return ""
        }
    }

    const encoder = "libx264"
    const profileName = "vprw-custom-profile"

    function buildVODOptions(options) {
        logger.info("Building VOD options")
        const outputOptions = [
            `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
            buildCRF("vod_crf"),
            buildPreset("vod_preset"),
            buildTune("vod_tune"),
            buildProfile("vod_profile"),
        ]
        return {
            outputOptions: outputOptions.filter((x) => x),
        }
    }
    transcodingManager.addVODProfile(encoder, profileName, buildVODOptions)

    function buildLiveOptions(options) {
        logger.info("Building LIVE options")
        const outputOptions = [
            `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
            buildCRF("live_crf"),
            buildPreset("live_preset"),
            buildTune("live_tune"),
            buildProfile("live_profile"),
        ]
        return {
            outputOptions: outputOptions.filter((x) => x),
        }
    }
    transcodingManager.addLiveProfile(encoder, profileName, buildLiveOptions)
}

async function unregister() {
    return
}

module.exports = {
    register,
    unregister,
}

function buildStreamSuffix(base, streamNum) {
    if (streamNum !== undefined) {
        return `${base}:${streamNum}`
    }
    return base
}
