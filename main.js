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
    const vod_default_audio_filter_enabled = false
    const vod_default_audio_filters = "loudnorm=I=-16:TP=-1.0"
    const live_default_crf = 21
    const live_default_preset = "fast"
    const live_default_tune = "zerolatency"
    const live_default_profile = "high"
    const live_default_audio_filter_enabled = false
    const live_default_audio_filters = ""

    const setting_crf_description =
    "Configure the encoding \"quality\". Lower values equate to superior quality but increased file sizes. The default setting is 23 (as per ffmpeg), with optimal values ranging from 18 to 28. Note the logarithmic range: an increase of 6 in the CRF value approximately doubles the file size, while a decrease of 6 halves it. Choose from a spectrum of 0-51."
    const setting_preset_description =
    "Specify the preset for encoding. A slower preset yields better compression, implying that for a specific file size or constant bit rate, a slower preset delivers enhanced quality. Conversely, for constant quality encoding, a slower preset conserves bitrate."
    const setting_tune_description =
    "Optimize settings for specific source types or scenarios. If you're uncertain, it's advisable to leave this setting as None."
    const setting_profile_description =
    "Designate the profile for encoding. Bear in mind that certain codecs do not support all profiles, and not every device is compatible with all profiles. If in doubt, leave this setting as None. This setting automatically adjusts the pixel format to match the selected profile. Developer note: despite the presence of two pixel format options (one set by the plugin, the other by PeerTube), ffmpeg will only utilize the final one."
    const setting_audio_filter_enabled_description =
    "Determine whether to implement audio filters during encoding. Admin notice: PeerTube may instruct ffmpeg to duplicate the audio stream by default, which could result in an error if you attempt to apply audio filtering. To circumvent this, ensure to recompile PeerTube with this option disabled (found in packages/ffmpeg/src/ffmpeg-default-transcoding-profile.ts, lines 47-49)."
    const setting_audio_filters_description =
    "Assign the audio filters to be utilized during encoding. By default, a rudimentary loudness normalization (-16 LUFS, -1 dBTP) is implemented."

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
        vod_audio_filter_enabled: await settingsManager.getSetting("vod_audio_filter_enabled") || vod_default_audio_filter_enabled,
        vod_audio_filters: await settingsManager.getSetting("vod_audio_filters") || vod_default_audio_filters,
        live_crf: await settingsManager.getSetting("live_crf") || live_default_crf,
        live_preset: await settingsManager.getSetting("live_preset") || live_default_preset,
        live_tune: await settingsManager.getSetting("live_tune") || live_default_tune,
        live_profile: await settingsManager.getSetting("live_profile") || live_default_profile,
        live_audio_filter_enabled: await settingsManager.getSetting("live_audio_filter_enabled") || live_default_audio_filter_enabled,
        live_audio_filters: await settingsManager.getSetting("live_audio_filters") || live_default_audio_filters,
    }
    settingsManager.onSettingsChange((settings) => {
        store.vod_crf = settings["vod_crf"]
        store.vod_preset = settings["vod_preset"]
        store.vod_tune = settings["vod_tune"]
        store.vod_profile = settings["vod_profile"]
        store.vod_audio_filter_enabled = settings["vod_audio_filter_enabled"]
        store.vod_audio_filters = settings["vod_audio_filters"]
        store.live_crf = settings["live_crf"]
        store.live_preset = settings["live_preset"]
        store.live_tune = settings["live_tune"]
        store.live_profile = settings["live_profile"]
        store.live_audio_filter_enabled = settings["live_audio_filter_enabled"]
        store.live_audio_filters = settings["live_audio_filters"]
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
        name: "vod_audio_filter_enabled",
        label: "[VOD] Add Audio Filter?",
        type: "input-checkbox",
        descriptionHTML: setting_audio_filter_enabled_description,
        private: true,
        default: vod_default_audio_filter_enabled,
    })
    registerSetting({
        name: "vod_audio_filters",
        label: "[VOD] Audio Filters",
        type: "input",
        descriptionHTML: setting_audio_filters_description,
        private: true,
        default: vod_default_audio_filters,
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
    registerSetting({
        name: "live_audio_filter_enabled",
        label: "[LIVE] Add Audio Filter?",
        type: "input-checkbox",
        descriptionHTML: setting_audio_filter_enabled_description,
        private: true,
        default: live_default_audio_filter_enabled,
    })
    registerSetting({
        name: "vod_audio_filters",
        label: "[LIVE] Audio Filters",
        type: "input",
        descriptionHTML: setting_audio_filters_description,
        private: true,
        default: live_default_audio_filters,
    })

    function buildCRF(settingName, options) {
        let crf = store[settingName]
        if (crf < 0) {
            crf = 0
        } else {
            crf = Math.min(crf, 51)
        }
        return `${buildStreamSuffix("-crf:v", options.streamNum)} ${crf}`
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

    function buildAudioFilter(settingName, options) {
        return store[settingName] ? `${buildStreamSuffix("-filter:a", options.streamNum)} ${store[settingName]}` : ""
    }

    const encoder = "libx264"
    const profileName = "vprw-custom-profile"

    function buildVODOptions(options) {
        logger.info("Building VOD options")
        const outputOptions = [
            `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
            buildCRF("vod_crf", options),
            buildPreset("vod_preset", options),
            buildTune("vod_tune", options),
            buildProfile("vod_profile", options),
            store.vod_audio_filter_enabled ? buildAudioFilter("vod_audio_filters", options) : "",
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
            buildCRF("live_crf", options),
            buildPreset("live_preset", options),
            buildTune("live_tune", options),
            buildProfile("live_profile", options),
            store.live_audio_filter_enabled ? buildAudioFilter("live_audio_filters", options) : "",
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
