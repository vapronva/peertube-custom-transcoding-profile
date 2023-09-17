async function register({
    registerSetting,
    settingsManager,
    transcodingManager
}) {
    const defaultCRF = 23
    const defaultPreset = "medium"
    const defaultTune = null
    const defaultProfile = null

    const store = {
        crf: await settingsManager.getSetting("crf") || defaultCRF,
        preset: await settingsManager.getSetting("preset") || defaultPreset,
        tune: await settingsManager.getSetting("tune") || defaultTune,
        profile: await settingsManager.getSetting("profile") || defaultProfile
    }
    settingsManager.onSettingsChange(settings => {
        store.crf = settings["crf"]
        store.preset = settings["preset"]
        store.tune = settings["tune"]
        store.profile = settings["profile"]
    })

    const buildVOD = (options) => {
        const outputOptions = [
            `-r ${options.fps}`,
            `-crf ${store.crf}`,
            `-preset ${store.preset}`
        ]
        if (store.tune) {
            outputOptions.push(`-tune ${store.tune}`)
        }
        if (store.profile) {
            outputOptions.push(`-profile:v ${store.profile}`)
            switch (store.profile) {
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
        return {
            outputOptions: [
                `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
                `-crf ${store.crf}`
            ]
        }
    }

    registerSetting({
        name: "crf",
        label: "Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: "Set the quality for the encode. Lower values mean better quality, but larger file sizes. The default is 23, and sane values are between 18 and 28. The range is logarithmic, so increasing the CRF by 6 roughly doubles the file size, while decreasing it by 6 roughly halves the file size. Available values are 0-51.",
        private: true,
        default: defaultCRF
    })

    registerSetting({
        name: "preset",
        label: "Preset",
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
        default: defaultPreset
    })

    registerSetting({
        name: "tune",
        label: "Tune",
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
        default: defaultTune
    })

    registerSetting({
        name: "profile",
        label: "Profile",
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
        default: defaultProfile
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

function buildStreamSuffix(base, streamNum) {
    if (streamNum !== undefined) {
        return `${base}:${streamNum}`
    }
    return base
}
