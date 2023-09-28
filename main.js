async function register({
    registerSetting,
    settingsManager,
    transcodingManager
}) {
    const vod_default_crf = 20
    const vod_default_preset = "slow"
    const vod_default_tune = null
    const vod_default_profile = "high"
    const live_default_crf = 21
    const live_default_preset = "fast"
    const live_default_tune = "zerolatency"
    const live_default_profile = "high"

    const store = {
        vod_crf: await settingsManager.getSetting("vod_crf") || vod_default_crf,
        vod_preset: await settingsManager.getSetting("vod_preset") || vod_default_preset,
        vod_tune: await settingsManager.getSetting("vod_tune") || vod_default_tune,
        vod_profile: await settingsManager.getSetting("vod_profile") || vod_default_profile,
        live_crf: await settingsManager.getSetting("live_crf") || live_default_crf,
        live_preset: await settingsManager.getSetting("live_preset") || live_default_preset,
        live_tune: await settingsManager.getSetting("live_tune") || live_default_tune,
        live_profile: await settingsManager.getSetting("live_profile") || live_default_profile
    }
    settingsManager.onSettingsChange(settings => {
        store.vod_crf = settings["vod_crf"]
        store.vod_preset = settings["vod_preset"]
        store.vod_tune = settings["vod_tune"]
        store.vod_profile = settings["vod_profile"]
        store.live_crf = settings["live_crf"]
        store.live_preset = settings["live_preset"]
        store.live_tune = settings["live_tune"]
        store.live_profile = settings["live_profile"]
    })

    const buildVOD = (options) => {
        const outputOptions = [
            `-r ${options.fps}`,
            `-crf ${store.vod_crf}`,
            `-preset ${store.vod_preset}`
        ]
        if (store.vod_tune) {
            outputOptions.push(`-tune ${store.vod_tune}`)
        }
        if (store.vod_profile) {
            outputOptions.push(`-profile:v ${store.vod_profile}`)
            switch (store.vod_profile) {
            case "high10":
                outputOptions.push("-pix_fmt yuv420p10le")
                break
            case "high422":
                outputOptions.push("-pix_fmt yuv422p")
                break
            case "high444":
                outputOptions.push("-pix_fmt yuv444p")
                break
            }
        }
        return {
            outputOptions
        }
    }

    const buildLive = (options) => {
        const outputOptions = [
            `-r ${options.fps}`,
            `-crf ${store.live_crf}`,
            `-preset ${store.live_preset}`
        ]
        if (store.live_tune) {
            outputOptions.push(`-tune ${store.live_tune}`)
        }
        if (store.live_profile) {
            outputOptions.push(`-profile:v ${store.live_profile}`)
            switch (store.live_profile) {
            case "high10":
                outputOptions.push("-pix_fmt yuv420p10le")
                break
            case "high422":
                outputOptions.push("-pix_fmt yuv422p")
                break
            case "high444":
                outputOptions.push("-pix_fmt yuv444p")
                break
            }
        }
        return {
            outputOptions
        }
    }

    registerSetting({
        name: "vod_crf",
        label: "[VOD] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: "Set the quality for the encode. Lower values mean better quality, but larger file sizes. The default is 23, and sane values are between 18 and 28. The range is logarithmic, so increasing the CRF by 6 roughly doubles the file size, while decreasing it by 6 roughly halves the file size. Available values are 0-51.",
        private: true,
        default: vod_default_crf
    })

    registerSetting({
        name: "vod_preset",
        label: "[VOD] Preset",
        type: "select",
        options: [
            { label: "Ultra Fast", value: "ultrafast" },
            { label: "Super Fast", value: "superfast" },
            { label: "Very Fast", value: "veryfast" },
            { label: "Faster", value: "faster" },
            { label: "Fast", value: "fast" },
            { label: "Medium", value: "medium" },
            { label: "Slow", value: "slow" },
            { label: "Slower", value: "slower" },
            { label: "Very Slow", value: "veryslow" }
        ],
        descriptionHTML: "Set the preset to be used when encoding. A slower preset will provide better compression (compression is quality per filesize). This means that, for example, if you target a certain file size or constant bit rate, you will achieve better quality with a slower preset. Similarly, for constant quality encoding, you will simply save bitrate by choosing a slower preset.",
        private: true,
        default: vod_default_preset
    })

    registerSetting({
        name: "vod_tune",
        label: "[VOD] Tune",
        type: "select",
        options: [
            { label: "None", value: null },
            { label: "Film", value: "film" },
            { label: "Animation", value: "animation" },
            { label: "Grain", value: "grain" },
            { label: "Still Image", value: "stillimage" },
            { label: "Fast Decode", value: "fastdecode" },
            { label: "Zero Latency", value: "zerolatency" },
        ],
        descriptionHTML: "Tune the settings for a particular type of source or situation. If you are unsure, leave this as None.",
        private: true,
        default: vod_default_tune
    })

    registerSetting({
        name: "vod_profile",
        label: "[VOD] Profile",
        type: "select",
        options: [
            { label: "None", value: null },
            { label: "Baseline", value: "baseline" },
            { label: "Main", value: "main" },
            { label: "High", value: "high" },
            { label: "High 10", value: "high10" },
            { label: "High 4:2:2", value: "high422" },
            { label: "High 4:4:4", value: "high444" },
        ],
        descriptionHTML: "Set the profile to be used when encoding. Note that some profiles are not supported by some codecs, and not all devices support all profiles. If you are unsure, leave this as None.",
        private: true,
        default: vod_default_profile
    })

    registerSetting({
        name: "live_crf",
        label: "[LIVE] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: "Set the quality for the encode. Lower values mean better quality, but larger file sizes. The default is 23, and sane values are between 18 and 28. The range is logarithmic, so increasing the CRF by 6 roughly doubles the file size, while decreasing it by 6 roughly halves the file size. Available values are 0-51.",
        private: true,
        default: vod_default_crf
    })

    registerSetting({
        name: "live_preset",
        label: "[LIVE] Preset",
        type: "select",
        options: [
            { label: "Ultra Fast", value: "ultrafast" },
            { label: "Super Fast", value: "superfast" },
            { label: "Very Fast", value: "veryfast" },
            { label: "Faster", value: "faster" },
            { label: "Fast", value: "fast" },
            { label: "Medium", value: "medium" },
            { label: "Slow", value: "slow" },
            { label: "Slower", value: "slower" },
            { label: "Very Slow", value: "veryslow" }
        ],
        descriptionHTML: "Set the preset to be used when encoding. A slower preset will provide better compression (compression is quality per filesize). This means that, for example, if you target a certain file size or constant bit rate, you will achieve better quality with a slower preset. Similarly, for constant quality encoding, you will simply save bitrate by choosing a slower preset.",
        private: true,
        default: vod_default_preset
    })

    registerSetting({
        name: "live_tune",
        label: "[LIVE] Tune",
        type: "select",
        options: [
            { label: "None", value: null },
            { label: "Film", value: "film" },
            { label: "Animation", value: "animation" },
            { label: "Grain", value: "grain" },
            { label: "Still Image", value: "stillimage" },
            { label: "Fast Decode", value: "fastdecode" },
            { label: "Zero Latency", value: "zerolatency" },
        ],
        descriptionHTML: "Tune the settings for a particular type of source or situation. If you are unsure, leave this as None.",
        private: true,
        default: vod_default_tune
    })

    registerSetting({
        name: "live_profile",
        label: "[LIVE] Profile",
        type: "select",
        options: [
            { label: "None", value: null },
            { label: "Baseline", value: "baseline" },
            { label: "Main", value: "main" },
            { label: "High", value: "high" },
            { label: "High 10", value: "high10" },
            { label: "High 4:2:2", value: "high422" },
            { label: "High 4:4:4", value: "high444" },
        ],
        descriptionHTML: "Set the profile to be used when encoding. Note that some profiles are not supported by some codecs, and not all devices support all profiles. If you are unsure, leave this as None.",
        private: true,
        default: vod_default_profile
    })

    const encoder = "libx264"
    const profileName = "vprw-custom-profile"

    transcodingManager.addVODProfile(encoder, profileName, buildVOD)
    transcodingManager.addLiveProfile(encoder, profileName, buildLive)
}

async function unregister() {
    return
}

module.exports = {
    register,
    unregister
}
