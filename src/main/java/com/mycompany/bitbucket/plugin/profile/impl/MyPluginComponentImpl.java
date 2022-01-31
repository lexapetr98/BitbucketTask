package com.mycompany.bitbucket.plugin.profile.impl;

import com.atlassian.sal.api.ApplicationProperties;
import com.mycompany.bitbucket.plugin.profile.api.MyPluginComponent;


public class MyPluginComponentImpl implements MyPluginComponent {
    private final ApplicationProperties applicationProperties;

    public MyPluginComponentImpl(final ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getName() {
        if (null != applicationProperties) {
            return "myComponent:" + applicationProperties.getDisplayName();
        }

        return "myComponent";
    }
}