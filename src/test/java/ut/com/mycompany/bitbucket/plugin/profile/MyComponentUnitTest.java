package ut.com.mycompany.bitbucket.plugin.profile;

import org.junit.Test;
import com.mycompany.bitbucket.plugin.profile.api.MyPluginComponent;
import com.mycompany.bitbucket.plugin.profile.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}